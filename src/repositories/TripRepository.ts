import type {
  TripDocument,
  TripMeta,
  Family,
  Location,
  Route,
  Meal,
  Activity,
} from '@/types'
import type {
  CreateFamilyInput,
  CreateLocationInput,
  CreateRouteInput,
  CreateMealInput,
  CreateActivityInput,
  CreateTripInput,
} from '@/types/inputs'

export interface Trip {
  id: string
  title: string
  start_date: string
  end_date: string
  timezone: string
  status: string
  created_at: string
  updated_at: string
}

export interface TripRepository {
  // Trip-level operations
  getTrip(tripId: string): Promise<TripDocument>
  updateTripMetadata(
    tripId: string,
    metadata: Partial<TripMeta>
  ): Promise<void>
  archiveTrip(tripId: string): Promise<void>
  unarchiveTrip(tripId: string): Promise<void>

  // Trip creation and active trip management
  createTrip(input: CreateTripInput): Promise<Trip>
  getActiveTripId(): Promise<string | null>

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
    location: CreateLocationInput,
    skipEntityCreation?: boolean
  ): Promise<{ location: Location; entityId?: string }>
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

  // Meal CRUD
  getMeals(tripId: string): Promise<Meal[]>
  addMeal(tripId: string, input: CreateMealInput): Promise<Meal>
  updateMeal(
    tripId: string,
    mealId: string,
    updates: Partial<Meal>
  ): Promise<Meal>
  deleteMeal(tripId: string, mealId: string): Promise<void>

  // Activity CRUD
  getActivities(tripId: string): Promise<Activity[]>
  addActivity(tripId: string, input: CreateActivityInput): Promise<Activity>
  updateActivity(
    tripId: string,
    activityId: string,
    updates: Partial<Activity>
  ): Promise<Activity>
  deleteActivity(tripId: string, activityId: string): Promise<void>
}
