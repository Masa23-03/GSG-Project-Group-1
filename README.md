# Multi-Vendor Medicine Pharmacy Delivery Platform


## Team Information

**Team Name:** NEXUS
**Team Leader:** [Masa Sabobeh](https://github.com/Masa23-03)

**Team Members:**

* [Lubna Jaradat](https://github.com/Lubna-Jaradat)
* [Masa Sabobeh](https://github.com/Masa23-03)
* [Nesreen Alzamli](https://github.com/nesreenazamli)
* [Shahd Abu Sharif](https://github.com/shahd-abu-sharif)


# Project Overview

This project is a multi-vendor medicine pharmacy delivery backend that connects:

* Patients
* Pharmacies
* Drivers
* Admin

The system enables patients to search for medicines across multiple pharmacies, place unified orders, and receive structured delivery through a controlled lifecycle.

It is designed as a transaction-safe, role-based system focused on:

* Business rule enforcement
* Clean domain boundaries
* Multi-actor coordination
* Data integrity


# Problem Statement

In many cities, patients face several challenges:

* Checking medicine availability across multiple pharmacies
* Comparing prices manually
* Sending prescriptions informally via messaging apps
* Managing separate orders from different pharmacies
* Coordinating delivery manually

There is no unified, structured system connecting patients, pharmacies, drivers, and admin.

This project solves that coordination problem through a rule-driven backend system.


# Solution Overview

This backend provides a structured, multi-actor platform that enables:

* Multi-pharmacy ordering within a single parent order
* Strict inventory control to prevent overselling
* Prescription-linked validation workflow
* Automatic delivery creation once pharmacies are ready
* Controlled driver lifecycle
* City-based delivery logic

The system is designed as a transaction-safe modular monolith focused on:

* Business rule enforcement
* Data integrity
* Clean domain separation
* Deterministic state transitions


# Live API

Production Deployment (Railway):

[https://gsg-project-group-1-production.up.railway.app](https://gsg-project-group-1-production.up.railway.app)

Swagger Documentation:

[https://gsg-project-group-1-production.up.railway.app/docs](https://gsg-project-group-1-production.up.railway.app/docs)


# System Architecture Diagram

```
Clients
  ├── Mobile App
  └── Web App
          │
          ▼
     REST API (NestJS)
          │
  ┌───────────────────────────────┐
  │        Modular Monolith       │
  │                               │
  │  Auth Module                  │
  │  User Module                  │
  │  Pharmacy Module              │
  │  Driver Module                │
  │  Medicine Module              │
  │  Inventory Module             │
  │  Prescription Module          │
  │  Order Module                 │
  │  Delivery Module              │
  │  City Module                  │
  └───────────────────────────────┘
          │
          ▼
      Prisma ORM
          │
          ▼
       MariaDB
```

Architecture Characteristics:

* Single deployable unit
* Domain-separated modules
* Centralized validation layer
* Transaction-safe operations via Prisma
* Role-based authorization middleware


# Architecture & Tech Stack

| Layer      | Technology             |
| ---------- | ---------------------- |
| Framework  | NestJS                 |
| Language   | TypeScript             |
| ORM        | Prisma                 |
| Database   | MariaDB                |
| Auth       | JWT (Access + Refresh) |
| Validation | Zod                    |
| Deployment | Railway                |
| API Docs   | Swagger                |

Architecture style: Modular Monolith.


# Design Principles

* Each module encapsulates:
  * Controller (transport layer only)
  * Service (business logic & state transitions)
  * DTOs and validation schemas
* No business logic inside controllers
* All state transitions enforced in service layer
* Explicit separation between domain logic and transport layer
* Shared utilities in `/utils`
* Global guards, interceptors, and exception filters centralized


# Core Business Flow

### Order Lifecycle

1. Patient places an order
2. Each pharmacy processes its portion independently
3. When all pharmacy orders reach READY_FOR_PICKUP
4. A single delivery is created
5. Driver accepts and completes delivery
6. Order transitions to DELIVERED

Transactional guarantees ensure:

* No stock overselling
* No duplicate pharmacy items
* Atomic delivery claim
* Consistent state synchronization

# System Guarantees

The backend enforces strict invariants:

* Inventory cannot be oversold.
* A delivery cannot be claimed by multiple drivers.
* Status transitions are validated before state changes.
* Cross-role data access is restricted using RBAC and ownership checks.
* Critical operations are protected using database transactions.

These guarantees ensure deterministic and predictable system behavior.

# Architectural Decisions

* Modular monolith chosen over microservices for controlled complexity
* Prisma for strong typing and transaction safety
* Zod for runtime validation
* Soft delete for recoverability
* Explicit state modeling for future extensibility


# Database Schema

[https://drawsql.app/teams/masa236/diagrams/gsg-group1](https://drawsql.app/teams/masa236/diagrams/gsg-group1)


# API Documentation

[https://gsg-project-group-1-production.up.railway.app/docs](https://gsg-project-group-1-production.up.railway.app/docs)


# UI Design

[https://www.figma.com/design/SFb6Ay8DQl6kBmGi0UzfqY/Multi-vendor-Medicine-Pharmacy-Delivery-App](https://www.figma.com/design/SFb6Ay8DQl6kBmGi0UzfqY/Multi-vendor-Medicine-Pharmacy-Delivery-App)


# Running the Project Locally

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run start:dev
```

# Security & Validation Strategy

* Passwords hashed using Argon2.
* JWT authentication with access and refresh tokens.
* Role-based guards for endpoint protection.
* Runtime validation using Zod schemas.
* Centralized exception filters to prevent sensitive error leakage.
* Consistent API response structure via interceptor.

# Project Status

This backend represents a fully functional MVP demonstrating:

* Multi-actor coordination
* Transactional ordering
* Delivery lifecycle control
* Structured prescription workflow
* Clean modular architecture

It is designed to be extended with payments, notifications, tracking, analytics, and AI features.


# What This Project Demonstrates

* Advanced state management
* Atomic transactional operations
* Complex domain modeling
* Clean backend architecture
* Real-world order and logistics coordination


# License

Developed as part of the Gaza Sky Geeks Bootcamp program.

