# Architecture

## System Overview

I want to replicate this spreadsheet of pricing calculator as a web version

![Migrate from MySQL](./docs/spreadsheet_migrate_from_mysql.png)

And we assume the MySQL workload is like a typical bursty pattern similar to a Sine curve.

![QPS curve](./docs/spreadsheet_sine_curve.png)

## How this spreadsheet work

In this spreadsheet calculator ![Migrate from MySQL](./docs/spreadsheet_migrate_from_mysql.png):

### Color code

- Orange: required customer workload data as input
- Blue: optional parameters
- Yellow: our list price of RCU/mo, 1M RU/mo and TiKV (row-based storage)
- Green: pricing results

### How other values are calculated

#### Intermediate Parameters

- Metering Storage Size(GB): `[Size of files under MySQL data directory] / 3 / [Compressed Size/Original Size]`
- Peak RCU: `[Peak vCPU used] * [RCU per vCPU]`
- Baseline RCU: `[Baseline vCPU used] * [RCU per vCPU]`
- Amplitude: `[Peak RCU] - [Baseline RCU]`
- Percentage of non-baseline workload: `1 - [Percentage of baseline workload]`
- Average Consumed RCU: `[Baseline vCPU used] * 1 + [Percentage of baseline workload] * [Amplitude] * 2 / PI()`

#### Price of Starter(Serverless)

- Storage Price: `[Metering Storage Size(GB)] * [Row-based Storage Price(GB)]`
- Consumed RU(Million): `[Average Consumed RCU] * 3600 * 730  / 1000000`
- RU Price: `[Consumed RU(Million)] * [Million RU Price]`
- Starter(Serverless) Total Price: `[Storage Price] + [RU Price]`

### Price of Essential

- Storage Price: `[Metering Storage Size(GB)] * [Row-based Storage Price(GB)]`
- Provisioned RCU: `MAX([Average Consumed RCU] / 0.9, 2000)`
- Provisioned RCU Price: `[Provisioned RCU] * [RCU Price]`
- Essential Total Price: `[Storage Price] + [Provisioned RCU Price]`

## Key Decisions

- Why we chose this framework
- Trade-offs made
- Open questions / risks

## Future Extensions

Ideas for scaling or evolving.
