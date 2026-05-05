import type {
  TripDocument,
  TripMeta,
  Family,
  Location,
  Route,
} from '@/types'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
} from '@/types/inputs'

export interface TripRepository {
  // Trip-level operations
  getTrip(tripId: string): Promise<TripDocument>
  updateTripMetadata(
    tripId: string,
    metadata: Partial<TripMeta>
  ): Promise<void>

  // Family CRUD
  getFamilies(tripId: string): Promise<Family[]>
  getFamily(tripId: string, familyId: string): Promise<Family>
  addFamily(tripId: string, family: CreateFamilyInput): Promise<Family>
  updateFamily(
    tripId: string,
    familyId: string,
    updates: Partial<Family>
  ): Promise<Family>
  deleteFamily(tripId: string, familyId: string): Promise<void>

  // Location CRUD
  getLocations(tripId: string): Promise<Location[]>
  getLocation(tripId: string, locationId: string): Promise<Location>
  addLocation(
    tripId: string,
    location: CreateLocationInput
  ): Promise<Location>
  updateLocation(
    tripId: string,
    locationId: string,
    updates: Partial<Location>
  ): Promise<Location>
  deleteLocation(tripId: string, locationId: string): Promise<void>

  // Route CRUD
  getRoutes(tripId: string): Promise<Route[]>
  getRoute(tripId: string, routeId: string): Promise<Route>
  addRoute(tripId: string, route: CreateRouteInput): Promise<Route>
  updateRoute(
    tripId: string,
    routeId: string,
    updates: Partial<Route>
  ): Promise<Route>
  deleteRoute(tripId: string, routeId: string): Promise<void>
}
