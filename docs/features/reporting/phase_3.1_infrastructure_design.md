# Reporting Phase 3.1 Infrastructure Design

**Status:** Draft

## Infrastructure Responsibilities
The Infrastructure layer is responsible for:
* Implementing ReportingRepository.
* Retrieving reporting data from the database.
* Performing aggregation.
* Mapping persistence models into Domain projections.
* Returning immutable Domain objects.
* Containing no business rules.
* Containing no UI logic.
* Containing no application orchestration.

## Directory Structure
```
src/features/reporting/
    infrastructure/
        repositories/
        datasources/
        mappers/
```

## Repository Implementation
ReportingRepositoryImpl implements ReportingRepository.

ReportingDataSource executes aggregation queries against the database.
ReportingRepositoryImpl does not perform aggregation.
ReportingRepositoryImpl only coordinates retrieval and mapping.

It delegates data retrieval to ReportingDataSource.

It maps persistence results into Domain projections using dedicated Infrastructure mappers.

It contains no business rules.

## Data Source Responsibilities
ReportingDataSource is responsible for:
* Executing database queries.
* Returning raw persistence results.
* Applying filtering.
* Executes aggregation queries against the database.
* Aggregation is performed by the database query, not by ReportingRepositoryImpl.
* Applying sorting.
* Applying pagination if required.
* No mapping to DTOs.
* No business validation.

## Infrastructure Mapper Responsibilities
Infrastructure Mappers convert:

Persistence Models
→
Domain Projections

They must not:
* format values
* localize values
* compute business rules
* return Response DTOs

## Error Handling Responsibilities
Data source surfaces persistence/database errors.
Repository translates persistence errors into Domain/Application repository errors.
Infrastructure does not swallow exceptions.
Infrastructure does not return partial reporting data.

## Dependency Flow
Application
    ↓
ReportingRepository
    ↓
ReportingRepositoryImpl
    ↓
ReportingDataSource
    ↓
Database

## Business Rules
Infrastructure MUST NOT determine:
* budget status
* savings rate
* business calculations

It only retrieves aggregated data.

## Not Included
This phase must NOT define:
* SQL
* Supabase queries
* indexes
* migrations
* TypeScript
* API routes
* React Query
* Hooks
* Components
* Charts

---
**Status:**
Draft
Pending Review
