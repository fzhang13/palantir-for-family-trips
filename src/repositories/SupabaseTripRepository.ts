import type { TripDocument, Family, Location, Route, TripMeta, Meal, Activity } from '@/types'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
  CreateMealInput,
  CreateActivityInput,
} from '@/types/inputs'
import type { TripRepository } from './TripRepository'
import { supabase } from '@/lib/supabase'

/**
 * Supabase-backed implementation of TripRepository.
 * Maps between the app's camelCase types and the DB's snake_case columns.
 */
export class SupabaseTripRepository implements TripRepository {
  private get client() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
    }
    return supabase
  }

  // ─── Trip Bootstrap ────────────────────────────────────────────────────────

  async ensureTrip(tripId: string): Promise<void> {
    const { data } = await this.client.from('trips').select('id').eq('id', tripId).maybeSingle()
    if (!data) {
      await this.client.from('trips').insert({
        id: tripId,
        title: 'My Family Trip',
        subtitle: '',
        timezone: 'America/Los_Angeles',
        metadata: {},
      })
    }
  }

  // ─── Trip ──────────────────────────────────────────────────────────────────

  async getTrip(tripId: string): Promise<TripDocument> {
    await this.ensureTrip(tripId)
    const [
      { data: families },
      { data: locations },
      { data: routes },
      { data: itineraryItems },
      { data: meals },
      { data: activities },
      { data: stayItems },
      { data: expenses },
      { data: tasks },
      { data: pageNotes },
    ] = await Promise.all([
      this.client.from('families').select('*').eq('trip_id', tripId),
      this.client.from('locations').select('*').eq('trip_id', tripId),
      this.client.from('routes').select('*').eq('trip_id', tripId),
      this.client.from('itinerary_items').select('*').eq('trip_id', tripId),
      this.client.from('meals').select('*').eq('trip_id', tripId),
      this.client.from('activities').select('*').eq('trip_id', tripId),
      this.client.from('stay_items').select('*').eq('trip_id', tripId),
      this.client.from('expenses').select('*').eq('trip_id', tripId),
      this.client.from('tasks').select('*').eq('trip_id', tripId),
      this.client.from('page_notes').select('*').eq('trip_id', tripId),
    ])

    const noteMap: Record<string, string> = {}
    const noteMetaMap: Record<string, unknown> = {}
    for (const note of pageNotes || []) {
      noteMap[note.page] = note.content || ''
      noteMetaMap[note.page] = note.meta || {}
    }

    return {
      selectedPage: 'itinerary',
      selection: null,
      pageNotes: noteMap as TripDocument['pageNotes'],
      pageNoteMeta: noteMetaMap,
      ui: {
        searchQuery: '',
        timeline: { mode: 'scenario', cursorSlot: 0 },
        map: { showRoutes: true, showFacilities: false, showTraffic: false, focusFamilyId: '', focusDayId: '' },
      },
      families: (families || []).map(this.mapFamilyFromDb),
      locations: (locations || []).map(this.mapLocationFromDb),
      routes: (routes || []).map(this.mapRouteFromDb),
      itineraryItems: (itineraryItems || []).map(this.mapItineraryItemFromDb),
      meals: (meals || []).map(this.mapMealFromDb),
      activities: (activities || []).map(this.mapActivityFromDb),
      stayItems: (stayItems || []).map(this.mapStayItemFromDb),
      expenses: (expenses || []).map(this.mapExpenseFromDb),
      tasks: (tasks || []).map(this.mapTaskFromDb),
    }
  }

  async updateTripMetadata(tripId: string, metadata: Partial<TripMeta>): Promise<void> {
    await this.client.from('trips').update({
      title: metadata.tripName,
      metadata: { timezone: metadata.timezone },
    }).eq('id', tripId)
  }

  // ─── Families ──────────────────────────────────────────────────────────────

  async getFamilies(tripId: string): Promise<Family[]> {
    const { data, error } = await this.client
      .from('families')
      .select('*')
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
    return (data || []).map(this.mapFamilyFromDb)
  }

  async getFamily(tripId: string, familyId: string): Promise<Family> {
    const { data, error } = await this.client
      .from('families')
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', familyId)
      .single()
    if (error) throw new Error(error.message)
    return this.mapFamilyFromDb(data)
  }

  async addFamily(tripId: string, input: CreateFamilyInput): Promise<Family> {
    await this.ensureTrip(tripId)
    const row = {
      trip_id: tripId,
      name: input.name,
      title: input.name,
      short_origin: this.extractShortOrigin(input.origin),
      origin: input.origin,
      origin_address: input.originAddress,
      origin_coordinates: input.originCoordinates,
      arrival_day_id: input.arrivalDayId || 'thu',
      eta: input.eta || 'TBD',
      drive_time: input.driveTime || 'TBD',
      headcount: input.headcount || '',
      vehicle: input.vehicle || 'SUV',
      vehicle_label: input.vehicleLabel || 'Vehicle',
      responsibility: input.responsibility || '',
      readiness: 0,
      status: 'Transit',
      route_summary: '',
      planned_stop_ids: [],
      note: input.note || '',
    }

    const { data, error } = await this.client
      .from('families')
      .insert(row)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapFamilyFromDb(data)
  }

  async updateFamily(tripId: string, familyId: string, updates: Partial<Family>): Promise<Family> {
    const row = this.mapFamilyToDb(updates)
    const { data, error } = await this.client
      .from('families')
      .update(row)
      .eq('id', familyId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapFamilyFromDb(data)
  }

  async deleteFamily(tripId: string, familyId: string): Promise<void> {
    const { error } = await this.client
      .from('families')
      .delete()
      .eq('id', familyId)
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
  }

  // ─── Locations ─────────────────────────────────────────────────────────────

  async getLocations(tripId: string): Promise<Location[]> {
    const { data, error } = await this.client
      .from('locations')
      .select('*')
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
    return (data || []).map(this.mapLocationFromDb)
  }

  async getLocation(tripId: string, locationId: string): Promise<Location> {
    const { data, error } = await this.client
      .from('locations')
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', locationId)
      .single()
    if (error) throw new Error(error.message)
    return this.mapLocationFromDb(data)
  }

  async addLocation(
    tripId: string,
    input: CreateLocationInput,
    skipEntityCreation = false
  ): Promise<{
    location: Location
    entityId?: string
  }> {
    await this.ensureTrip(tripId)

    // Insert location record
    const row = {
      trip_id: tripId,
      title: input.title,
      category: input.category,
      day_id: input.dayId || 'all',
      address: input.address,
      coordinates: input.coordinates,
      external_url: input.externalUrl,
      summary: input.summary || '',
      stop_type: input.stopType,
      places_query: input.placesQuery,
      parking_note: input.parkingNote,
      access_note: input.accessNote,
      directions_note: input.directionsNote,
      check_in_date: input.checkInDate || null,
      check_out_date: input.checkOutDate || null,
      place_id: input.placeId || null,
      photos: [],
    }

    const { data: locationData, error: locErr } = await this.client
      .from('locations')
      .insert(row)
      .select()
      .single()
    if (locErr) throw new Error(locErr.message)

    const location = this.mapLocationFromDb(locationData)
    let entityId: string | undefined

    // Skip entity creation if requested (e.g., when addActivity/addMeal will create it)
    if (skipEntityCreation) {
      return { location }
    }

    // Create corresponding entity based on category
    switch (input.category) {
      case 'meal': {
        const mealRow = {
          trip_id: tripId,
          location_id: location.id,
          title: input.title,
          day_id: input.dayId || 'all',
          start_slot: 0,
          status: 'Pending' as const,
          owner: '',
          reservation_type: '',
          time_label: '',
          note: '',
        }
        const { data: mealData, error: mealErr } = await this.client
          .from('meals')
          .insert(mealRow)
          .select('id')
          .single()
        if (mealErr) throw new Error(`Failed to create meal: ${mealErr.message}`)
        entityId = mealData.id
        break
      }

      case 'activity': {
        const activityRow = {
          trip_id: tripId,
          location_id: location.id,
          title: input.title,
          day_id: input.dayId || 'all',
          window: '',
          status: 'Go' as const,
          risk_level: '',
          weather_sensitivity: '',
          description: '',
          backup: '',
          note: '',
        }
        const { data: activityData, error: actErr } = await this.client
          .from('activities')
          .insert(activityRow)
          .select('id')
          .single()
        if (actErr) throw new Error(`Failed to create activity: ${actErr.message}`)
        entityId = activityData.id
        break
      }

      case 'stay': {
        const stayRow = {
          trip_id: tripId,
          location_id: location.id,
          title: input.title,
          day_id: input.dayId || 'all',
          category: '',
          summary: input.summary || '',
          note: '',
        }
        const { data: stayData, error: stayErr } = await this.client
          .from('stay_items')
          .insert(stayRow)
          .select('id')
          .single()
        if (stayErr) throw new Error(`Failed to create stay item: ${stayErr.message}`)
        entityId = stayData.id
        break
      }
    }

    return { location, entityId }
  }

  async updateLocation(tripId: string, locationId: string, updates: Partial<Location>): Promise<Location> {
    const row = this.mapLocationToDb(updates)
    const { data, error } = await this.client
      .from('locations')
      .update(row)
      .eq('id', locationId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapLocationFromDb(data)
  }

  async deleteLocation(tripId: string, locationId: string): Promise<void> {
    const { error } = await this.client
      .from('locations')
      .delete()
      .eq('id', locationId)
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
  }

  // ─── Meals ─────────────────────────────────────────────────────────────────

  async getMeals(tripId: string): Promise<Meal[]> {
    const { data, error } = await this.client
      .from('meals')
      .select('*')
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)

    // Fetch all junction table entries for this trip's meals
    const mealIds = (data || []).map(row => row.id)
    const { data: junctionData } = await this.client
      .from('meal_families')
      .select('meal_id, family_id')
      .in('meal_id', mealIds)

    // Group family IDs by meal ID
    const familyIdsByMeal: Record<string, string[]> = {}
    for (const row of junctionData || []) {
      if (!familyIdsByMeal[row.meal_id]) {
        familyIdsByMeal[row.meal_id] = []
      }
      familyIdsByMeal[row.meal_id].push(row.family_id)
    }

    // Map meals and attach family IDs
    return (data || []).map(row => {
      const meal = this.mapMealFromDb(row)
      meal.familyIds = familyIdsByMeal[meal.id] || []
      return meal
    })
  }

  async getMeal(tripId: string, mealId: string): Promise<Meal> {
    return this.getMealById(tripId, mealId)
  }

  async addMeal(tripId: string, input: CreateMealInput): Promise<Meal> {
    await this.ensureTrip(tripId)

    let locationId = input.locationId

    // Create location if requested
    if (input.createLocation) {
      const { location } = await this.addLocation(
        tripId,
        {
          ...input.createLocation,
          category: 'meal',
        },
        true // Skip entity creation - we'll create the meal below
      )
      locationId = location.id
    }

    const row = {
      trip_id: tripId,
      title: input.title,
      day_id: input.dayId,
      start_slot: input.startSlot || 0,
      status: input.status || 'Pending',
      owner: input.owner || '',
      reservation_type: input.reservationType || '',
      time_label: input.timeLabel || '',
      location_id: locationId,
      note: input.note || '',
      meal_date: input.mealDate || null,
      meal_type: input.mealType || null,
      requires_reservation: input.requiresReservation ?? null,
    }

    const { data, error } = await this.client
      .from('meals')
      .insert(row)
      .select()
      .single()
    if (error) throw new Error(error.message)

    const meal = this.mapMealFromDb(data)

    // Handle meal_families junction table
    if (input.familyIds && input.familyIds.length > 0) {
      const junctionRows = input.familyIds.map(familyId => ({
        meal_id: meal.id,
        family_id: familyId,
      }))

      const { error: junctionError } = await this.client
        .from('meal_families')
        .insert(junctionRows)

      if (junctionError) throw new Error(`Failed to link families to meal: ${junctionError.message}`)
    }

    // Fetch the meal again to get the familyIds from the junction table
    return this.getMealById(tripId, meal.id)
  }

  /**
   * Helper method to get meal by ID with familyIds populated from junction table
   */
  private async getMealById(tripId: string, mealId: string): Promise<Meal> {
    const { data: mealData, error: mealError } = await this.client
      .from('meals')
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', mealId)
      .single()

    if (mealError) throw new Error(mealError.message)

    // Fetch family IDs from junction table
    const { data: junctionData, error: junctionError } = await this.client
      .from('meal_families')
      .select('family_id')
      .eq('meal_id', mealId)

    if (junctionError) throw new Error(junctionError.message)

    const familyIds = (junctionData || []).map(row => row.family_id)

    const meal = this.mapMealFromDb(mealData)
    meal.familyIds = familyIds

    return meal
  }

  async updateMeal(tripId: string, mealId: string, updates: Partial<Meal>): Promise<Meal> {
    const row = this.mapMealToDb(updates)
    const { data, error } = await this.client
      .from('meals')
      .update(row)
      .eq('id', mealId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Handle familyIds update if provided
    if (updates.familyIds !== undefined) {
      // Delete existing junction records
      const { error: deleteError } = await this.client
        .from('meal_families')
        .delete()
        .eq('meal_id', mealId)

      if (deleteError) throw new Error(`Failed to clear meal families: ${deleteError.message}`)

      // Insert new junction records
      if (updates.familyIds.length > 0) {
        const junctionRows = updates.familyIds.map(familyId => ({
          meal_id: mealId,
          family_id: familyId,
        }))

        const { error: insertError } = await this.client
          .from('meal_families')
          .insert(junctionRows)

        if (insertError) throw new Error(`Failed to update meal families: ${insertError.message}`)
      }
    }

    return this.getMealById(tripId, mealId)
  }

  async deleteMeal(tripId: string, mealId: string): Promise<void> {
    // Delete junction table records first (foreign key constraint)
    const { error: junctionError } = await this.client
      .from('meal_families')
      .delete()
      .eq('meal_id', mealId)

    if (junctionError) throw new Error(`Failed to delete meal families: ${junctionError.message}`)

    // Delete the meal record
    const { error } = await this.client
      .from('meals')
      .delete()
      .eq('id', mealId)
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
  }

  // ─── Activities ────────────────────────────────────────────────────────────

  async getActivities(tripId: string): Promise<Activity[]> {
    const { data, error } = await this.client
      .from('activities')
      .select('*')
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
    return (data || []).map(this.mapActivityFromDb)
  }

  async getActivity(tripId: string, activityId: string): Promise<Activity> {
    const { data, error } = await this.client
      .from('activities')
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', activityId)
      .single()
    if (error) throw new Error(error.message)
    return this.mapActivityFromDb(data)
  }

  async addActivity(tripId: string, input: CreateActivityInput): Promise<Activity> {
    await this.ensureTrip(tripId)

    let locationId = input.locationId
    let backupLocationId = input.backupLocationId

    // Create location if requested
    if (input.createLocation) {
      const { location } = await this.addLocation(
        tripId,
        {
          ...input.createLocation,
          category: 'activity',
        },
        true // Skip entity creation - we'll create the activity below
      )
      locationId = location.id
    }

    // Create backup location if requested
    if (input.createBackupLocation) {
      const { location: backupLocation } = await this.addLocation(
        tripId,
        {
          ...input.createBackupLocation,
          category: 'activity',
        },
        true // Skip entity creation
      )
      backupLocationId = backupLocation.id
    }

    const row = {
      trip_id: tripId,
      title: input.title,
      day_id: input.dayId,
      window: input.window || '',
      status: input.status || 'Go',
      risk_level: input.riskLevel || '',
      weather_sensitivity: input.weatherSensitivity || '',
      location_id: locationId,
      description: input.description || '',
      backup: input.backup || '',
      note: input.note || '',
      activity_date: input.activityDate || null,
      time_period: input.timePeriod || null,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      backup_location_id: backupLocationId || null,
      weather_data: input.weatherData || null,
    }

    const { data, error } = await this.client
      .from('activities')
      .insert(row)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapActivityFromDb(data)
  }

  async updateActivity(tripId: string, activityId: string, updates: Partial<Activity>): Promise<Activity> {
    const row = this.mapActivityToDb(updates)
    const { data, error } = await this.client
      .from('activities')
      .update(row)
      .eq('id', activityId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapActivityFromDb(data)
  }

  async deleteActivity(tripId: string, activityId: string): Promise<void> {
    const { error } = await this.client
      .from('activities')
      .delete()
      .eq('id', activityId)
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
  }

  // ─── Routes ────────────────────────────────────────────────────────────────

  async getRoutes(tripId: string): Promise<Route[]> {
    const { data, error } = await this.client
      .from('routes')
      .select('*')
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
    return (data || []).map(this.mapRouteFromDb)
  }

  async getRoute(tripId: string, routeId: string): Promise<Route> {
    const { data, error } = await this.client
      .from('routes')
      .select('*')
      .eq('trip_id', tripId)
      .eq('id', routeId)
      .single()
    if (error) throw new Error(error.message)
    return this.mapRouteFromDb(data)
  }

  async addRoute(tripId: string, input: CreateRouteInput): Promise<Route> {
    await this.ensureTrip(tripId)
    // Validate family exists
    const { data: family, error: famErr } = await this.client
      .from('families')
      .select('origin_coordinates')
      .eq('id', input.familyId)
      .eq('trip_id', tripId)
      .single()
    if (famErr || !family) throw new Error(`Family ${input.familyId} not found`)

    // Validate destination exists
    const { data: dest, error: destErr } = await this.client
      .from('locations')
      .select('id')
      .eq('id', input.destinationLocationId)
      .eq('trip_id', tripId)
      .single()
    if (destErr || !dest) throw new Error(`Destination location ${input.destinationLocationId} not found`)

    let originCoordinates = family.origin_coordinates
    const stopLocationIds: string[] = []

    if (input.originLocationId) {
      const { data: originLoc, error: origErr } = await this.client
        .from('locations')
        .select('coordinates')
        .eq('id', input.originLocationId)
        .eq('trip_id', tripId)
        .single()
      if (origErr || !originLoc) throw new Error(`Origin location ${input.originLocationId} not found`)
      originCoordinates = originLoc.coordinates
      stopLocationIds.push(input.originLocationId)
    }

    const row = {
      trip_id: tripId,
      title: `Route`,
      day_id: `day${input.day}`,
      family_id: input.familyId,
      tone: '#3b82f6',
      origin_coordinates: originCoordinates,
      stop_location_ids: stopLocationIds,
      destination_location_id: input.destinationLocationId,
      simulation_start_slot: 0,
      simulation_end_slot: 0,
      duration_seconds: input.durationSeconds || 0,
      path: input.path || [],
      dashed: false,
    }

    const { data, error } = await this.client
      .from('routes')
      .insert(row)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapRouteFromDb(data)
  }

  async updateRoute(tripId: string, routeId: string, updates: Partial<Route>): Promise<Route> {
    const row = this.mapRouteToDb(updates)
    const { data, error } = await this.client
      .from('routes')
      .update(row)
      .eq('id', routeId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)
    return this.mapRouteFromDb(data)
  }

  async deleteRoute(tripId: string, routeId: string): Promise<void> {
    const { error } = await this.client
      .from('routes')
      .delete()
      .eq('id', routeId)
      .eq('trip_id', tripId)
    if (error) throw new Error(error.message)
  }

  // ─── Mappers: DB → App ────────────────────────────────────────────────────

  private mapFamilyFromDb = (row: Record<string, unknown>): Family => ({
    id: row.id as string,
    type: 'family',
    title: (row.title as string) || (row.name as string),
    name: row.name as string,
    shortOrigin: (row.short_origin as string) || '',
    origin: (row.origin as string) || '',
    originAddress: (row.origin_address as string) || '',
    originCoordinates: (row.origin_coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    arrivalDayId: (row.arrival_day_id as string) || 'thu',
    eta: (row.eta as string) || '',
    driveTime: (row.drive_time as string) || '',
    headcount: (row.headcount as string) || '',
    vehicle: (row.vehicle as string) || '',
    vehicleLabel: (row.vehicle_label as string) || '',
    responsibility: (row.responsibility as string) || '',
    readiness: (row.readiness as number) || 0,
    status: (row.status as string) || 'Transit',
    routeSummary: (row.route_summary as string) || '',
    plannedStopIds: (row.planned_stop_ids as string[]) || [],
    taskIds: [],
    linkedEntityKeys: [],
    note: (row.note as string) || '',
  })

  private mapLocationFromDb = (row: Record<string, unknown>): Location => ({
    id: row.id as string,
    type: 'location',
    title: row.title as string,
    category: row.category as Location['category'],
    dayId: (row.day_id as string) || '',
    address: (row.address as string) || '',
    coordinates: (row.coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    externalUrl: row.external_url as string | null,
    summary: (row.summary as string) || '',
    parkingNote: row.parking_note as string | null,
    accessNote: row.access_note as string | null,
    directionsNote: row.directions_note as string | null,
    lockNote: row.lock_note as string | null,
    checkIn: row.check_in as string | null,
    checkOut: row.check_out as string | null,
    wifiNetwork: row.wifi_network as string | null,
    wifiPassword: row.wifi_password as string | null,
    hostName: row.host_name as string | null,
    coHostName: row.co_host_name as string | null,
    guestSummary: row.guest_summary as string | null,
    confirmationCode: row.confirmation_code as string | null,
    vehicleFee: row.vehicle_fee as string | null,
    manualUrl: row.manual_url as string | null,
    photos: (row.photos as Location['photos']) || [],
    stopType: row.stop_type as string | undefined,
    placesQuery: row.places_query as string | undefined,
    reservationNote: row.reservation_note as string | undefined,
    checkInDate: row.check_in_date as string | null,
    checkOutDate: row.check_out_date as string | null,
    placeId: row.place_id as string | null,
    linkedEntityKeys: [],
  })

  private mapRouteFromDb = (row: Record<string, unknown>): Route => ({
    id: row.id as string,
    type: 'route',
    title: (row.title as string) || '',
    dayId: (row.day_id as string) || '',
    familyId: (row.family_id as string) || '',
    tone: (row.tone as string) || '#3b82f6',
    originCoordinates: (row.origin_coordinates as { lat: number; lng: number }) || { lat: 0, lng: 0 },
    stopLocationIds: (row.stop_location_ids as string[]) || [],
    destinationLocationId: row.destination_location_id as string | undefined,
    simulationStartSlot: (row.simulation_start_slot as number) || 0,
    simulationEndSlot: (row.simulation_end_slot as number) || 0,
    durationSeconds: (row.duration_seconds as number) || 0,
    simulationMilestones: row.simulation_milestones as Route['simulationMilestones'],
    path: (row.path as Route['path']) || [],
    linkedEntityKey: `route:${row.id}`,
    dashed: (row.dashed as boolean) || false,
  })

  private mapItineraryItemFromDb = (row: Record<string, unknown>): import('@/types').ItineraryItem => ({
    id: row.id as string,
    type: 'itineraryItem',
    title: (row.title as string) || '',
    rowId: (row.row_id as string) || '',
    dayId: (row.day_id as string) || '',
    startSlot: (row.start_slot as number) || 0,
    span: (row.span as number) || 1,
    color: (row.color as string) || '#3b82f6',
    familyIds: (row.family_ids as string[]) || [],
    routeId: row.route_id as string | undefined,
    locationId: row.location_id as string | undefined,
    status: row.status as string | undefined,
    riskLevel: row.risk_level as string | undefined,
    taskIds: [],
    linkedEntityKeys: [],
  })

  private mapMealFromDb = (row: Record<string, unknown>): import('@/types').Meal => ({
    id: row.id as string,
    type: 'meal',
    title: (row.title as string) || '',
    dayId: (row.day_id as string) || '',
    startSlot: (row.start_slot as number) || 0,
    status: (row.status as 'Assigned' | 'Pending' | 'Confirmed') || 'Pending',
    owner: (row.owner as string) || '',
    reservationType: (row.reservation_type as string) || '',
    timeLabel: (row.time_label as string) || '',
    locationId: row.location_id as string | undefined,
    linkedEntityKeys: [],
    taskIds: [],
    note: row.note as string | undefined,
    mealDate: row.meal_date as string | null,
    mealType: row.meal_type as 'breakfast' | 'brunch' | 'lunch' | 'dinner' | null,
    requiresReservation: row.requires_reservation as boolean | null,
    familyIds: [],  // Will be populated by caller when fetching from junction table
  })

  private mapActivityFromDb = (row: Record<string, unknown>): import('@/types').Activity => ({
    id: row.id as string,
    type: 'activity',
    title: (row.title as string) || '',
    dayId: (row.day_id as string) || '',
    window: (row.window as string) || '',
    status: (row.status as 'Go' | 'Watch') || 'Go',
    riskLevel: (row.risk_level as string) || '',
    weatherSensitivity: (row.weather_sensitivity as string) || '',
    locationId: row.location_id as string | undefined,
    description: row.description as string | undefined,
    backup: row.backup as string | undefined,
    note: row.note as string | undefined,
    activityDate: row.activity_date as string | null,
    timePeriod: row.time_period as 'morning' | 'afternoon' | 'evening' | 'all_day' | 'flexible' | null,
    startTime: row.start_time as string | null,
    endTime: row.end_time as string | null,
    backupLocationId: row.backup_location_id as string | null,
    weatherData: row.weather_data as Activity['weatherData'] | null,
    linkedEntityKeys: [],
    taskIds: [],
  })

  private mapStayItemFromDb = (row: Record<string, unknown>): import('@/types').StayItem => ({
    id: row.id as string,
    type: 'stayItem',
    title: (row.title as string) || '',
    dayId: (row.day_id as string) || '',
    locationId: (row.location_id as string) || '',
    category: (row.category as string) || '',
    summary: (row.summary as string) || '',
    linkedEntityKeys: [],
    taskIds: [],
    note: row.note as string | undefined,
  })

  private mapExpenseFromDb = (row: Record<string, unknown>): import('@/types').Expense => ({
    id: row.id as string,
    type: 'expense',
    title: (row.title as string) || '',
    payer: (row.payer as string) || '',
    amount: Number(row.amount) || 0,
    split: (row.split as string) || '',
    allocationMode: (row.allocation_mode as 'equal' | 'manual' | 'individual') || 'equal',
    allocations: (row.allocations as Record<string, number>) || {},
    settled: (row.settled as boolean) || false,
    linkedEntityKeys: [],
    note: row.note as string | undefined,
  })

  private mapTaskFromDb = (row: Record<string, unknown>): import('@/types').Task => ({
    id: row.id as string,
    type: 'task',
    title: (row.title as string) || '',
    dayId: (row.day_id as string) || '',
    status: (row.status as 'done' | 'open' | 'blocked') || 'open',
    ownerFamilyId: row.owner_family_id as string | null,
    linkedEntityKeys: [],
    note: row.note as string | undefined,
  })

  // ─── Mappers: App → DB (partial updates) ──────────────────────────────────

  private mapFamilyToDb(updates: Partial<Family>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (updates.name !== undefined) row.name = updates.name
    if (updates.title !== undefined) row.title = updates.title
    if (updates.shortOrigin !== undefined) row.short_origin = updates.shortOrigin
    if (updates.origin !== undefined) row.origin = updates.origin
    if (updates.originAddress !== undefined) row.origin_address = updates.originAddress
    if (updates.originCoordinates !== undefined) row.origin_coordinates = updates.originCoordinates
    if (updates.arrivalDayId !== undefined) row.arrival_day_id = updates.arrivalDayId
    if (updates.eta !== undefined) row.eta = updates.eta
    if (updates.driveTime !== undefined) row.drive_time = updates.driveTime
    if (updates.headcount !== undefined) row.headcount = updates.headcount
    if (updates.vehicle !== undefined) row.vehicle = updates.vehicle
    if (updates.vehicleLabel !== undefined) row.vehicle_label = updates.vehicleLabel
    if (updates.responsibility !== undefined) row.responsibility = updates.responsibility
    if (updates.readiness !== undefined) row.readiness = updates.readiness
    if (updates.status !== undefined) row.status = updates.status
    if (updates.routeSummary !== undefined) row.route_summary = updates.routeSummary
    if (updates.plannedStopIds !== undefined) row.planned_stop_ids = updates.plannedStopIds
    if (updates.note !== undefined) row.note = updates.note
    return row
  }

  private mapLocationToDb(updates: Partial<Location>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (updates.title !== undefined) row.title = updates.title
    if (updates.category !== undefined) row.category = updates.category
    if (updates.dayId !== undefined) row.day_id = updates.dayId
    if (updates.address !== undefined) row.address = updates.address
    if (updates.coordinates !== undefined) row.coordinates = updates.coordinates
    if (updates.externalUrl !== undefined) row.external_url = updates.externalUrl
    if (updates.summary !== undefined) row.summary = updates.summary
    if (updates.parkingNote !== undefined) row.parking_note = updates.parkingNote
    if (updates.accessNote !== undefined) row.access_note = updates.accessNote
    if (updates.directionsNote !== undefined) row.directions_note = updates.directionsNote
    if (updates.lockNote !== undefined) row.lock_note = updates.lockNote
    if (updates.checkIn !== undefined) row.check_in = updates.checkIn
    if (updates.checkOut !== undefined) row.check_out = updates.checkOut
    if (updates.wifiNetwork !== undefined) row.wifi_network = updates.wifiNetwork
    if (updates.wifiPassword !== undefined) row.wifi_password = updates.wifiPassword
    if (updates.hostName !== undefined) row.host_name = updates.hostName
    if (updates.coHostName !== undefined) row.co_host_name = updates.coHostName
    if (updates.guestSummary !== undefined) row.guest_summary = updates.guestSummary
    if (updates.confirmationCode !== undefined) row.confirmation_code = updates.confirmationCode
    if (updates.vehicleFee !== undefined) row.vehicle_fee = updates.vehicleFee
    if (updates.manualUrl !== undefined) row.manual_url = updates.manualUrl
    if (updates.photos !== undefined) row.photos = updates.photos
    if (updates.stopType !== undefined) row.stop_type = updates.stopType
    if (updates.placesQuery !== undefined) row.places_query = updates.placesQuery
    if (updates.reservationNote !== undefined) row.reservation_note = updates.reservationNote
    if (updates.checkInDate !== undefined) row.check_in_date = updates.checkInDate
    if (updates.checkOutDate !== undefined) row.check_out_date = updates.checkOutDate
    if (updates.placeId !== undefined) row.place_id = updates.placeId
    return row
  }

  private mapRouteToDb(updates: Partial<Route>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (updates.title !== undefined) row.title = updates.title
    if (updates.dayId !== undefined) row.day_id = updates.dayId
    if (updates.familyId !== undefined) row.family_id = updates.familyId
    if (updates.tone !== undefined) row.tone = updates.tone
    if (updates.originCoordinates !== undefined) row.origin_coordinates = updates.originCoordinates
    if (updates.stopLocationIds !== undefined) row.stop_location_ids = updates.stopLocationIds
    if (updates.destinationLocationId !== undefined) row.destination_location_id = updates.destinationLocationId
    if (updates.simulationStartSlot !== undefined) row.simulation_start_slot = updates.simulationStartSlot
    if (updates.simulationEndSlot !== undefined) row.simulation_end_slot = updates.simulationEndSlot
    if (updates.durationSeconds !== undefined) row.duration_seconds = updates.durationSeconds
    if (updates.simulationMilestones !== undefined) row.simulation_milestones = updates.simulationMilestones
    if (updates.path !== undefined) row.path = updates.path
    if (updates.dashed !== undefined) row.dashed = updates.dashed
    return row
  }

  private mapMealToDb(updates: Partial<import('@/types').Meal>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (updates.title !== undefined) row.title = updates.title
    if (updates.dayId !== undefined) row.day_id = updates.dayId
    if (updates.startSlot !== undefined) row.start_slot = updates.startSlot
    if (updates.status !== undefined) row.status = updates.status
    if (updates.owner !== undefined) row.owner = updates.owner
    if (updates.reservationType !== undefined) row.reservation_type = updates.reservationType
    if (updates.timeLabel !== undefined) row.time_label = updates.timeLabel
    if (updates.locationId !== undefined) row.location_id = updates.locationId
    if (updates.note !== undefined) row.note = updates.note
    if (updates.mealDate !== undefined) row.meal_date = updates.mealDate
    if (updates.mealType !== undefined) row.meal_type = updates.mealType
    if (updates.requiresReservation !== undefined) row.requires_reservation = updates.requiresReservation
    return row
  }

  private mapActivityToDb(updates: Partial<import('@/types').Activity>): Record<string, unknown> {
    const row: Record<string, unknown> = {}
    if (updates.title !== undefined) row.title = updates.title
    if (updates.dayId !== undefined) row.day_id = updates.dayId
    if (updates.window !== undefined) row.window = updates.window
    if (updates.status !== undefined) row.status = updates.status
    if (updates.riskLevel !== undefined) row.risk_level = updates.riskLevel
    if (updates.weatherSensitivity !== undefined) row.weather_sensitivity = updates.weatherSensitivity
    if (updates.locationId !== undefined) row.location_id = updates.locationId
    if (updates.description !== undefined) row.description = updates.description
    if (updates.backup !== undefined) row.backup = updates.backup
    if (updates.note !== undefined) row.note = updates.note
    if (updates.activityDate !== undefined) row.activity_date = updates.activityDate
    if (updates.timePeriod !== undefined) row.time_period = updates.timePeriod
    if (updates.startTime !== undefined) row.start_time = updates.startTime
    if (updates.endTime !== undefined) row.end_time = updates.endTime
    if (updates.backupLocationId !== undefined) row.backup_location_id = updates.backupLocationId
    if (updates.weatherData !== undefined) row.weather_data = updates.weatherData
    return row
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private extractShortOrigin(origin: string): string {
    const words = origin.split(' ')
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }
}

export const supabaseTripRepository = new SupabaseTripRepository()
