# AuMinds LMS Platform

AuMinds is a modern, high-performance Learning Management System built with Next.js 14, Drizzle ORM, PostgreSQL, Tailwind CSS, Base UI, and S3-compatible Blob Storage.

## Features
- **Interactive LMS Courses**: Support for Video lessons, Markdown content, and embedded Monaco Code Editor.
- **Assignment System**: Homework submission and instructor feedback loop.
- **Quizzes**: Interactive quiz engine with real-time scoring.
- **Community Lounge**: Discussion chat platform.
- **Railway Ready**: Native support for Railway PostgreSQL and Railway S3 Object Storage (MinIO / S3).

## Deployment on Railway
1. Link PostgreSQL database service in Railway (`DATABASE_URL`).
2. Provision MinIO / S3-compatible Object Storage service on Railway.
3. Configure environment variables (`S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_PUBLIC_URL`, `JWT_SECRET`).
4. Deploy application!
