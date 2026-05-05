import type { TripDocument, Family, Location, Route, TripMeta } from '@/types'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
} from '@/types/inputs'
import type { TripRepository } from './TripRepository'
import { generateFamilyId, generateLocationId, generateRouteId } from '@/utils/idGenerator'
import { TRIP_DOCUMENT_STORAGE_KEY } from '@/models/tripModel'

export class LocalStorageTripRepository implements TripRepository {
  private getStoredTrip(_tripId: string): TripDocument {
    const stored = localStorage.getItem(TRIP_DOCUMENT_STORAGE_KEY)
    if (!stored) {
      throw new Error('No trip data found in localStorage')
    }

    try {
      const trip = JSON.parse(stored)
      return trip
    } catch (error) {
      throw new Error('Failed to parse trip data from localStorage')
    }
  }

  private saveTrip(_tripId: string, trip: TripDocument): void {
    try {
      localStorage.setItem(TRIP_DOCUMENT_STORAGE_KEY, JSON.stringify(trip))
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error(
          'Storage quota exceeded. Export your trip data or delete old trips.'
        )
      }
      throw error
    }
  }

  // Trip-level operations
  async getTrip(tripId: string): Promise<TripDocument> {
    return this.getStoredTrip(tripId)
  }

  async updateTripMetadata(
    tripId: string,
    _metadata: Partial<TripMeta>
  ): Promise<void> {
    const trip = this.getStoredTrip(tripId)
    // Note: Trip structure doesn't have top-level metadata in current design
    // This would update fields like title, subtitle if they existed at trip root
    this.saveTrip(tripId, trip)
  }

  // Family CRUD
  async getFamilies(tripId: string): Promise<Family[]> {
    const trip = this.getStoredTrip(tripId)
    return trip.families
  }

  async getFamily(tripId: string, familyId: string): Promise<Family> {
    const families = await this.getFamilies(tripId)
    const family = families.find((f) => f.id === familyId)
    if (!family) {
      throw new Error(`Family ${familyId} not found`)
    }
    return family
  }

  async addFamily(
    tripId: string,
    input: CreateFamilyInput
  ): Promise<Family> {
    const trip = this.getStoredTrip(tripId)
    const newFamily: Family = {
      id: generateFamilyId(),
      type: 'family',
      title: input.name,
      name: input.name,
      shortOrigin: this.extractShortOrigin(input.origin),
      origin: input.origin,
      originAddress: input.originAddress,
      originCoordinates: input.originCoordinates,
      arrivalDayId: input.arrivalDayId || 'thu',
      eta: input.eta || 'TBD',
      driveTime: input.driveTime || 'TBD',
      headcount: input.headcount || '',
      vehicle: input.vehicle || 'SUV',
      vehicleLabel: input.vehicleLabel || 'Vehicle',
      responsibility: input.responsibility || '',
      readiness: 0,
      status: 'Transit',
      routeSummary: '',
      plannedStopIds: [],
      taskIds: [],
      linkedEntityKeys: [],
      note: input.note || '',
    }

    trip.families.push(newFamily)
    this.saveTrip(tripId, trip)
    return newFamily
  }

  async updateFamily(
    tripId: string,
    familyId: string,
    updates: Partial<Family>
  ): Promise<Family> {
    const trip = this.getStoredTrip(tripId)
    const familyIndex = trip.families.findIndex((f) => f.id === familyId)
    if (familyIndex === -1) {
      throw new Error(`Family ${familyId} not found`)
    }

    const updatedFamily = { ...trip.families[familyIndex], ...updates }
    trip.families[familyIndex] = updatedFamily
    this.saveTrip(tripId, trip)
    return updatedFamily
  }

  async deleteFamily(tripId: string, familyId: string): Promise<void> {
    const trip = this.getStoredTrip(tripId)
    trip.families = trip.families.filter((f) => f.id !== familyId)
    // TODO: Handle cascade - delete or reassign routes
    this.saveTrip(tripId, trip)
  }

  // Helper to extract short origin (e.g., "San Francisco" -> "SF")
  private extractShortOrigin(origin: string): string {
    const words = origin.split(' ')
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase()
    return words
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
  }

  // Location CRUD
  async getLocations(tripId: string): Promise<Location[]> {
    const trip = this.getStoredTrip(tripId)
    return trip.locations
  }

  async getLocation(tripId: string, locationId: string): Promise<Location> {
    const locations = await this.getLocations(tripId)
    const location = locations.find((l) => l.id === locationId)
    if (!location) {
      throw new Error(`Location ${locationId} not found`)
    }
    return location
  }

  async addLocation(
    tripId: string,
    input: CreateLocationInput
  ): Promise<Location> {
    const trip = this.getStoredTrip(tripId)
    const newLocation: Location = {
      id: generateLocationId(),
      type: 'location',
      title: input.title,
      category: input.category,
      dayId: input.dayId || 'all',
      address: input.address,
      coordinates: input.coordinates,
      externalUrl: input.externalUrl,
      summary: input.summary || '',
      stopType: input.stopType,
      placesQuery: input.placesQuery,
      parkingNote: input.parkingNote,
      accessNote: input.accessNote,
      directionsNote: input.directionsNote,
      linkedEntityKeys: [],
      photos: [],
    }

    trip.locations.push(newLocation)
    this.saveTrip(tripId, trip)
    return newLocation
  }

  async updateLocation(
    tripId: string,
    locationId: string,
    updates: Partial<Location>
  ): Promise<Location> {
    const trip = this.getStoredTrip(tripId)
    const locationIndex = trip.locations.findIndex((l) => l.id === locationId)
    if (locationIndex === -1) {
      throw new Error(`Location ${locationId} not found`)
    }

    const updatedLocation = { ...trip.locations[locationIndex], ...updates }
    trip.locations[locationIndex] = updatedLocation
    this.saveTrip(tripId, trip)
    return updatedLocation
  }

  async deleteLocation(tripId: string, locationId: string): Promise<void> {
    const trip = this.getStoredTrip(tripId)
    trip.locations = trip.locations.filter((l) => l.id !== locationId)
    // TODO: Remove from routes that reference this location
    this.saveTrip(tripId, trip)
  }

  // Route CRUD
  async getRoutes(tripId: string): Promise<Route[]> {
    const trip = this.getStoredTrip(tripId)
    return trip.routes
  }

  async getRoute(tripId: string, routeId: string): Promise<Route> {
    const routes = await this.getRoutes(tripId)
    const route = routes.find((r) => r.id === routeId)
    if (!route) {
      throw new Error(`Route ${routeId} not found`)
    }
    return route
  }

  async addRoute(tripId: string, input: CreateRouteInput): Promise<Route> {
    const trip = this.getStoredTrip(tripId)

    // Get family origin for route origin coordinates
    const family = trip.families.find((f) => f.id === input.familyId)
    if (!family) {
      throw new Error(`Family ${input.familyId} not found`)
    }

    // Verify destination location exists
    const destinationLocation = trip.locations.find(
      (l) => l.id === input.destinationLocationId
    )
    if (!destinationLocation) {
      throw new Error(`Destination location ${input.destinationLocationId} not found`)
    }

    // Get origin location if specified, otherwise use family origin
    let originCoordinates = family.originCoordinates
    const stopLocationIds: string[] = []

    if (input.originLocationId) {
      const originLocation = trip.locations.find((l) => l.id === input.originLocationId)
      if (!originLocation) {
        throw new Error(`Origin location ${input.originLocationId} not found`)
      }
      originCoordinates = originLocation.coordinates
      stopLocationIds.push(input.originLocationId)
    }

    const newRoute: Route = {
      id: generateRouteId(),
      type: 'route',
      title: `Route for ${family.name}`,
      dayId: `day${input.day}`,
      familyId: input.familyId,
      tone: '#3b82f6', // Default blue
      originCoordinates,
      stopLocationIds,
      destinationLocationId: input.destinationLocationId,
      simulationStartSlot: 0,
      simulationEndSlot: 0,
      durationSeconds: 0, // Will be calculated by Google Maps API
      linkedEntityKey: `route-${generateRouteId()}`,
      // Path will be populated by Google Maps API
      path: [],
    }

    trip.routes.push(newRoute)
    this.saveTrip(tripId, trip)
    return newRoute
  }

  async updateRoute(
    tripId: string,
    routeId: string,
    updates: Partial<Route>
  ): Promise<Route> {
    const trip = this.getStoredTrip(tripId)
    const routeIndex = trip.routes.findIndex((r) => r.id === routeId)
    if (routeIndex === -1) {
      throw new Error(`Route ${routeId} not found`)
    }

    const updatedRoute = { ...trip.routes[routeIndex], ...updates }
    trip.routes[routeIndex] = updatedRoute
    this.saveTrip(tripId, trip)
    return updatedRoute
  }

  async deleteRoute(tripId: string, routeId: string): Promise<void> {
    const trip = this.getStoredTrip(tripId)
    trip.routes = trip.routes.filter((r) => r.id !== routeId)
    this.saveTrip(tripId, trip)
  }
}

// Create singleton instance
export const tripRepository = new LocalStorageTripRepository()
