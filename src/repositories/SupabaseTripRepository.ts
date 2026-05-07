import type { TripDocument, Family, Location, Route, TripMeta, Meal, Activity } from '@/types'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
  CreateMealInput,
  CreateActivityInput,
  CreateTripInput,
} from '@/types/inputs'
import type { TripRepository, Trip } from './TripRepository'
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
      // Set default trip dates: today + 7 days
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() + 7)
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 4) // 5-day trip by default

      await this.client.from('trips').insert({
        id: tripId,
        title: 'My Family Trip',
        subtitle: '',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        timezone: 'America/Los_Angeles',
        metadata: {},
        status: 'active',
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
    const updates: Record<string, any> = {}

    if (metadata.tripName !== undefined) updates.title = metadata.tripName
    if (metadata.startDate !== undefined) updates.start_date = metadata.startDate
    if (metadata.endDate !== undefined) updates.end_date = metadata.endDate
    if (metadata.timezone !== undefined) {
      updates.metadata = { timezone: metadata.timezone }
    }

    await this.client.from('trips').update(updates).eq('id', tripId)
  }

  async archiveTrip(tripId: string): Promise<void> {
    const { error } = await this.client
      .from('trips')
      .update({ status: 'archived' })
      .eq('id', tripId)

    if (error) throw new Error(error.message)
  }

  async unarchiveTrip(tripId: string): Promise<void> {
    const { error } = await this.client
      .from('trips')
      .update({ status: 'active' })
      .eq('id', tripId)

    if (error) throw new Error(error.message)
  }

  async createTrip(input: CreateTripInput): Promise<Trip> {
    const { data, error } = await this.client
      .from('trips')
      .insert({
        title: input.title,
        start_date: input.start_date,
        end_date: input.end_date,
        timezone: input.timezone,
        status: 'active',
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getActiveTripId(): Promise<string | null> {
    const { data, error } = await this.client
      .from('trips')
      .select('id')
      .eq('status', 'active')
      .order('start_date', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (error) throw error
    return data?.id || null
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
      arrival_day_id: input.arrivalDayId || null,
      eta: input.eta || 'TBD',
      drive_time: input.driveTime || 'TBD',
      headcount: input.headcount || '',
      vehicle: input.vehicle || 'SUV',
      vehicle_label: input.vehicleLabel || 'Vehicle',
      responsibility: input.responsibility || '',
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
    const row: any = {
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

    // Add day range fields for stay locations
    if ('startDayNumber' in input) row.start_day_number = input.startDayNumber
    if ('endDayNumber' in input) row.end_day_number = input.endDayNumber

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
        const stayRow: Record<string, unknown> = {
          trip_id: tripId,
          location_id: location.id,
          title: input.title,
          day_id: input.dayId || 'all',
          category: '',
          summary: input.summary || '',
          note: '',
        }
        // Copy day range from location to stay_item
        if ('startDayNumber' in input) stayRow.start_day_number = input.startDayNumber
        if ('endDayNumber' in input) stayRow.end_day_number = input.endDayNumber
        
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
    
    // If this is a stay location and day numbers changed, sync to stay_items
    if (data.category === 'stay' && ('start_day_number' in row || 'end_day_number' in row)) {
      const stayUpdates: Record<string, unknown> = {}
      if ('start_day_number' in row) stayUpdates.start_day_number = row.start_day_number
      if ('end_day_number' in row) stayUpdates.end_day_number = row.end_day_number
      
      if (Object.keys(stayUpdates).length > 0) {
        await this.client
          .from('stay_items')
          .update(stayUpdates)
          .eq('location_id', locationId)
          .eq('trip_id', tripId)
      }
    }
    
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

    // Step 1: Create location if provided, or use existing location ID
    let locationId: string | null = null
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
    } else if (input.locationId) {
      // Reference an existing location (e.g., stay location for "eating at home")
      locationId = input.locationId
    }

    // Step 2: Build new field values from input
    const newFields = {
      trip_id: tripId,
      title: input.title,
      meal_date: input.mealDate,
      meal_type: input.mealType,
      requires_reservation: input.requiresReservation || false,
      status: input.status,
      time_label: input.time || '',
      note: input.note || '',
      location_id: locationId,
    }

    // Step 3: Derive old fields for backward compatibility
    const oldFields = {
      day_id: deriveDayId(input.mealDate),
      start_slot: deriveStartSlot(input.mealType),
      owner: '', // Will be populated after family insert
      reservation_type: input.requiresReservation ? 'Required' : '',
    }

    // Step 4: Insert meal with both new and old fields
    const { data, error } = await this.client
      .from('meals')
      .insert({
        ...newFields,
        ...oldFields,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)

    const meal = this.mapMealFromDb(data)

    // Step 5: Insert family associations if provided
    if (input.familyIds && input.familyIds.length > 0) {
      const familyInserts = input.familyIds.map(familyId => ({
        meal_id: meal.id,
        family_id: familyId,
      }))

      const { error: familyError } = await this.client
        .from('meal_families')
        .insert(familyInserts)

      if (familyError) throw new Error(`Failed to link families to meal: ${familyError.message}`)

      // Step 6: Update owner field with family names (backward compat)
      const { data: families } = await this.client
        .from('families')
        .select('name')
        .in('id', input.familyIds)

      if (families) {
        const ownerText = families.map(f => f.name).join(', ')

        await this.client
          .from('meals')
          .update({ owner: ownerText })
          .eq('id', meal.id)
      }
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

  async updateMeal(
    tripId: string,
    mealId: string,
    updates: Partial<CreateMealInput>
  ): Promise<Meal> {
    // Build new fields from updates
    const newFields: any = {}
    const oldFields: any = {}

    if (updates.title !== undefined) newFields.title = updates.title
    if (updates.mealDate !== undefined) {
      newFields.meal_date = updates.mealDate
      oldFields.day_id = deriveDayId(updates.mealDate)
    }
    if (updates.mealType !== undefined) {
      newFields.meal_type = updates.mealType
      oldFields.start_slot = deriveStartSlot(updates.mealType)
    }
    if (updates.status !== undefined) newFields.status = updates.status
    if (updates.time !== undefined) newFields.time_label = updates.time
    if (updates.note !== undefined) newFields.note = updates.note
    if (updates.requiresReservation !== undefined) {
      newFields.requires_reservation = updates.requiresReservation
      oldFields.reservation_type = updates.requiresReservation ? 'Required' : ''
    }

    // Handle location update
    if (updates.createLocation) {
      const { location } = await this.addLocation(
        tripId,
        {
          ...updates.createLocation,
          category: 'meal',
        },
        true
      )
      newFields.location_id = location.id
    } else if (updates.locationId !== undefined) {
      // Reference an existing location (e.g., stay location for "eating at home")
      newFields.location_id = updates.locationId
    }

    // Update meal with both new and old fields
    const { error } = await this.client
      .from('meals')
      .update({ ...newFields, ...oldFields })
      .eq('id', mealId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Update family associations if provided
    if (updates.familyIds !== undefined) {
      // Delete existing associations
      await this.client
        .from('meal_families')
        .delete()
        .eq('meal_id', mealId)

      // Insert new associations
      if (updates.familyIds.length > 0) {
        const familyInserts = updates.familyIds.map(familyId => ({
          meal_id: mealId,
          family_id: familyId,
        }))

        await this.client
          .from('meal_families')
          .insert(familyInserts)

        // Update owner field (backward compat)
        const { data: families } = await this.client
          .from('families')
          .select('name')
          .in('id', updates.familyIds)

        if (families) {
          const ownerText = families.map(f => f.name).join(', ')
          await this.client
            .from('meals')
            .update({ owner: ownerText })
            .eq('id', mealId)
        }
      } else {
        // Clear owner if no families
        await this.client
          .from('meals')
          .update({ owner: '' })
          .eq('id', mealId)
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

    // Step 1: Create locations if provided, or use existing location IDs
    let locationId: string | null = null
    let backupLocationId: string | null = null

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
    } else if (input.locationId) {
      // Reference an existing location
      locationId = input.locationId
    }

    if (input.createBackupLocation) {
      const { location: backupLocation } = await this.addLocation(
        tripId,
        {
          ...input.createBackupLocation,
          category: 'activity',
        },
        true
      )
      backupLocationId = backupLocation.id
    }

    // Step 2: Build new field values from input
    const newFields = {
      trip_id: tripId,
      title: input.title,
      activity_date: input.activityDate,
      time_period: input.timePeriod,
      start_time: input.startTime || null,
      end_time: input.endTime || null,
      status: input.status,
      risk_level: input.riskLevel || '',
      weather_sensitivity: input.weatherSensitivity || '',
      location_id: locationId,
      backup_location_id: backupLocationId,
      description: input.description || '',
      backup: input.backup || '',
      note: input.note || '',
      weather_data: input.weatherData || null,
    }

    // Step 3: Derive old fields for backward compatibility
    const oldFields = {
      day_id: deriveDayId(input.activityDate),
      window: deriveWindow(input.timePeriod, input.startTime, input.endTime),
    }

    // Step 4: Derive weather sensitivity from weather data if not provided
    if (!input.weatherSensitivity && input.weatherData) {
      newFields.weather_sensitivity = deriveWeatherSensitivity(input.weatherData)
    }

    // Step 5: Insert activity with both new and old fields
    const { data, error } = await this.client
      .from('activities')
      .insert({
        ...newFields,
        ...oldFields,
      })
      .select()
      .single()
    if (error) throw new Error(error.message)

    const activity = this.mapActivityFromDb(data)

    // Step 6: Insert family associations if provided
    if (input.familyIds && input.familyIds.length > 0) {
      const familyInserts = input.familyIds.map(familyId => ({
        activity_id: activity.id,
        family_id: familyId,
      }))

      const { error: familyError } = await this.client
        .from('activity_families')
        .insert(familyInserts)

      if (familyError) throw new Error(`Failed to link families to activity: ${familyError.message}`)
    }

    return activity
  }

  async updateActivity(
    tripId: string,
    activityId: string,
    updates: Partial<CreateActivityInput>
  ): Promise<Activity> {
    // Build new fields from updates
    const newFields: any = {}
    const oldFields: any = {}

    if (updates.title !== undefined) newFields.title = updates.title
    if (updates.activityDate !== undefined) {
      newFields.activity_date = updates.activityDate
      oldFields.day_id = deriveDayId(updates.activityDate)
    }
    if (updates.timePeriod !== undefined) {
      newFields.time_period = updates.timePeriod
      // Update window if time period or times change
      oldFields.window = deriveWindow(
        updates.timePeriod,
        updates.startTime,
        updates.endTime
      )
    }
    if (updates.startTime !== undefined) newFields.start_time = updates.startTime
    if (updates.endTime !== undefined) newFields.end_time = updates.endTime
    if (updates.status !== undefined) newFields.status = updates.status
    if (updates.riskLevel !== undefined) newFields.risk_level = updates.riskLevel
    if (updates.weatherSensitivity !== undefined) {
      newFields.weather_sensitivity = updates.weatherSensitivity
    }
    if (updates.description !== undefined) newFields.description = updates.description
    if (updates.backup !== undefined) newFields.backup = updates.backup
    if (updates.note !== undefined) newFields.note = updates.note
    if (updates.weatherData !== undefined) {
      newFields.weather_data = updates.weatherData
      // Auto-derive sensitivity from weather data if not explicitly set
      if (!updates.weatherSensitivity) {
        newFields.weather_sensitivity = deriveWeatherSensitivity(updates.weatherData)
      }
    }

    // Handle location updates
    if (updates.createLocation) {
      const { location } = await this.addLocation(
        tripId,
        {
          ...updates.createLocation,
          category: 'activity',
        },
        true
      )
      newFields.location_id = location.id
    } else if (updates.locationId !== undefined) {
      // Reference an existing location
      newFields.location_id = updates.locationId
    }

    if (updates.createBackupLocation) {
      const { location: backupLocation } = await this.addLocation(
        tripId,
        {
          ...updates.createBackupLocation,
          category: 'activity',
        },
        true
      )
      newFields.backup_location_id = backupLocation.id
    }

    // Update activity with both new and old fields
    const { data, error } = await this.client
      .from('activities')
      .update({ ...newFields, ...oldFields })
      .eq('id', activityId)
      .eq('trip_id', tripId)
      .select()
      .single()
    if (error) throw new Error(error.message)

    // Update family associations if provided
    if (updates.familyIds !== undefined) {
      // Delete existing associations
      await this.client
        .from('activity_families')
        .delete()
        .eq('activity_id', activityId)

      // Insert new associations
      if (updates.familyIds.length > 0) {
        const familyInserts = updates.familyIds.map(familyId => ({
          activity_id: activityId,
          family_id: familyId,
        }))

        await this.client
          .from('activity_families')
          .insert(familyInserts)
      }
    }

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
    arrivalDayId: (row.arrival_day_id as string) || '',
    eta: (row.eta as string) || '',
    driveTime: (row.drive_time as string) || '',
    headcount: (row.headcount as string) || '',
    vehicle: (row.vehicle as string) || '',
    vehicleLabel: (row.vehicle_label as string) || '',
    responsibility: (row.responsibility as string) || '',
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
    startDayNumber: row.start_day_number as number | null | undefined,
    endDayNumber: row.end_day_number as number | null | undefined,
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
    startDayNumber: row.start_day_number as number | null | undefined,
    endDayNumber: row.end_day_number as number | null | undefined,
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
    if (updates.startDayNumber !== undefined) row.start_day_number = updates.startDayNumber
    if (updates.endDayNumber !== undefined) row.end_day_number = updates.endDayNumber
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

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private extractShortOrigin(origin: string): string {
    const words = origin.split(' ')
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return words.slice(0, 2).map((w) => w[0]).join('').toUpperCase()
  }
}

// ─── Helper Functions for Dual-Write Logic ────────────────────────────────

// Helper: Derive day_id from ISO date string
function deriveDayId(isoDate: string): string {
  const date = new Date(isoDate + 'T00:00:00')
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
  return days[date.getDay()]
}

// Helper: Derive start_slot from meal type (for timeline positioning)
function deriveStartSlot(mealType: string): number {
  const slots: Record<string, number> = {
    breakfast: 8,
    brunch: 10,
    lunch: 12,
    dinner: 18
  }
  return slots[mealType] || 12
}

// Helper: Derive window display string from time period and times
function deriveWindow(
  timePeriod: string,
  startTime?: string,
  endTime?: string
): string {
  // If specific times provided, use them
  if (startTime && endTime) {
    return `${startTime} - ${endTime}`
  }

  // Otherwise, use time period label
  const labels: Record<string, string> = {
    morning: 'Morning',
    afternoon: 'Afternoon',
    evening: 'Evening',
    all_day: 'All Day',
    flexible: 'Flexible'
  }
  return labels[timePeriod] || 'Window TBD'
}

// Helper: Derive weather sensitivity from weather data
function deriveWeatherSensitivity(weatherData: any): string {
  if (!weatherData) return ''

  const { condition, precipitation } = weatherData

  if (condition?.includes('Rain') || precipitation > 50) {
    return 'High'
  } else if (condition?.includes('Cloud') || precipitation > 20) {
    return 'Moderate'
  }
  return 'Low'
}

export const supabaseTripRepository = new SupabaseTripRepository()
