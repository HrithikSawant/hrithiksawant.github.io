---
icon: fas fa-info-circle
order: 4
---

I'm a DevOps and Site Reliability engineer in Mumbai, open to remote work. For the last two years I built and operated infrastructure for a multi-tenant security platform: Kafka log pipelines, terabyte-scale backups on AWS, and the automation around them. At home I run Kubernetes, Terraform, Crossplane and Prometheus/Grafana/Loki labs to keep learning the platform side.

> Open to **DevOps, SRE and Platform Engineering** roles.
{: .prompt-tip }

## Selected work

**Backup and recovery for SIEM data at terabyte scale** ([One2N case study](https://one2n.io/case-studies/backup-and-recovery-solution-for-siem-data-at-terabyte-scale))
An automated backup and restore system for a managed security provider's SIEM platform: 1.5 TB of security data a day, 100+ tenants, tenant-level retention and restore, running for under $200 a month on AWS. I designed and built it on my own in about four months.

**Routing sensitive logs to a Syslog server with Log4j2** ([blog post](https://one2n.io/blog/routing-sensitive-logs))
How we split sensitive logs, out of roughly 10,000 per second, into a separate destination using Log4j2 appenders and central configuration instead of code changes.

## Experience

**Software Engineer, One2N** (2022 – 2024, remote)

- Designed a Spring Boot and Apache Kafka log-ingestion middleware that decouples producers from consumers, improving throughput and reliability of security log pipelines.
- Built the automated backup pipeline for 1.5 TB/day of SIEM data across on-prem and AWS EC2 systems, syncing to S3 for 100+ tenants.
- Cut recovery time for tenant data incidents by automating a tenant-aware restore workflow, removing manual steps from disaster recovery.
- Orchestrated VM provisioning and deployment configuration for more consistent deployments across environments.
- Built API endpoints with hardened access controls to protect tenant data, and helped operate a 100+ tenant environment.

**Software Engineer Intern, One2N** (2022)
Built a Spring Boot application with role-based access control and JWT-secured REST APIs, using test-driven development.

## What I work with

| Area | Tools |
| --- | --- |
| Cloud and infrastructure | AWS (EC2, S3, VPC, IAM, Route 53, API Gateway, STS), Linux |
| Containers and orchestration | Docker, Docker Compose, Kubernetes (Minikube and Kind labs), Helm basics |
| Infrastructure as code | Terraform, Crossplane, Ansible |
| Observability | Prometheus, Grafana, Loki |
| CI/CD and automation | GitHub Actions, Bash |
| Languages | Go, Python, Java, Bash |
| Backend and data | Spring Boot, Kafka, FastAPI, PostgreSQL |

## Home-lab and side projects

- **Cloud-native IaC.** Provisioned AWS resources (EC2, S3, VPC) with Crossplane and Terraform, and used Ansible for configuration management. Practised least-privilege IAM and VPC design.
- **Kubernetes and observability.** Local clusters running Prometheus, Grafana and Loki, used to practise scaling, rolling updates and troubleshooting from monitoring data.
- **Customer data pipeline.** A containerised ETL system (Flask, FastAPI, PostgreSQL) with Docker Compose and idempotent upserts.
- **Go CLI tools.** A `wc` clone, a JSON validator with a hand-written recursive-descent parser, and a seat-allocation engine.
- **iximiuz Labs.** Hands-on Linux, container and Kubernetes challenges: [my learner profile](https://labs.iximiuz.com/u/hrithiksawant).

## Education

M.Sc. and B.Sc. in Computer Science, SIES College (Autonomous), University of Mumbai.

## Elsewhere

[GitHub](https://github.com/HrithikSawant) · [LinkedIn](https://www.linkedin.com/in/hrithik-sawant) · [iximiuz Labs](https://labs.iximiuz.com/u/hrithiksawant)
