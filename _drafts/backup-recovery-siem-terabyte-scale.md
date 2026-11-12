---
title: "Backing up 1.5 TB of SIEM data a day for under $200 a month"
categories: [AWS, Backup]
tags: [aws, s3, backup, linux, nfs, siem, glacier]
description: How I built a tenant-aware backup and restore pipeline for a multi-tenant SIEM platform, and what each design choice was for.
---

> This is the engineer's view of a project One2N also wrote up as a [case study](https://one2n.io/case-studies/backup-and-recovery-solution-for-siem-data-at-terabyte-scale). The case study covers the outcome. This post is about the decisions.
{: .prompt-info }

## The problem

A managed security provider ran a SIEM platform for more than a hundred tenants in sectors like healthcare, energy and finance. Across the platform, about 1.5 TB of events and logs arrived every day. A backup process already existed, but it no longer matched the business and compliance needs: it cost too much, tenants could not customise retention, and it took too much hand-holding.

The requirements we agreed with the security operations and platform teams were:

- data kept separate per tenant, each with its own retention
- backups and restores that run without manual steps
- alerts when a backup succeeds or fails
- restore of one tenant for a chosen date range
- one central backup store with auditing and role-based access

## What we were backing up

The platform had two kinds of machines. **Orchestration nodes** held configuration, and **data nodes** held the actual events and logs, with each tenant living on one data node. Our setup had 2 orchestration nodes and 24 data nodes spread across several data centres.

Configuration was the easy half. It was about 5 GB per orchestration node, so the platform could export it as a tar file and a small Bash script sent it to S3. Event data was the hard half: a single data node could produce more than 200 GB in a day.

## The pipeline

1. Copy each tenant's data directories from the data node to an NFS server with `scp`.
2. Mount that NFS share on a separate processing server and package the directories into tar files there.
3. Upload the tar files to S3 archival storage, then delete the originals from both the processing server and NFS.

The three stages run in parallel wherever they can, and the pipeline checks free disk space so a big day cannot fill a volume mid-copy.

## Problems I hit, and what I changed

**Production latency.** My first version did the `tar` and the upload on the data nodes themselves. CPU and disk IO went up enough to hurt latency for live traffic. Moving the heavy work to the NFS and processing servers took that load off the data nodes entirely. <!-- EDIT: add how you noticed it (which metric or alert) and how long it took to find -->

**Network bandwidth.** Sending 1.5 TB to S3 every day competes with production traffic. I capped upload bandwidth with the AWS CLI's `--max_bandwidth` setting and used a dedicated network path for the transfer. <!-- EDIT: what cap you chose and how you picked it -->

**Slow uploads.** Uploading one file at a time left bandwidth unused. Running 10 uploads concurrently used the available link much better. <!-- EDIT: before and after transfer times if you remember them -->

**Cost.** Event data goes to S3 Glacier Deep Archive, and configuration backups stay in S3 Standard. Lifecycle rules delete data once its retention period ends, default retention is set on the buckets, and versioning is on. With that setup, Deep Archive storage for the whole platform costs under $200 a month.

## Restore

The restore script runs the same path in reverse. It pulls the right objects from S3 and puts the directories back into the tenant's own structure on the data node. Because backups are separated by tenant, restoring one tenant for a date range does not touch anyone else. <!-- EDIT: describe one real restore or a restore drill, and the time it took -->

## Running in production

The solution has run across all of the client's regions since January 2023 with little operational attention.

## What I would do differently

<!-- EDIT: the most valuable section. Two or three honest points, for example: restore testing cadence, alerting gaps, what you would automate or monitor next, or whether you would choose a different transfer tool today. -->
