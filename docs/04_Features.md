# EngineerPath Features

Version 1.0

---

# Feature 1: Authentication

## Description

The authentication system allows users to securely create an account, log in, manage their profile, and access personalized content.

---

## Purpose

Provide secure access to EngineerPath and personalize the experience for every student.

---

## Users

- Student
- Admin

---

## Functional Requirements

### Sign Up

The student should be able to:

- Register using email
- Register using Google
- Create password
- Verify email
- Accept Terms & Privacy Policy

---

### Login

Users should be able to:

- Login using email/password
- Login using Google
- Stay logged in
- Logout securely

---

### Forgot Password

Users should:

- Request password reset
- Receive reset email
- Create new password

---

### Profile Setup

After registration:

Student should enter

- Full Name
- College
- Branch
- Graduation Year
- Current Semester
- Preferred Career
- Skills (optional)
- Interests
- LinkedIn Profile (optional)
- GitHub Profile (optional)

---

## Validation

Email must be unique.

Password must contain:

- Minimum 8 characters
- One uppercase letter
- One lowercase letter
- One number

---

## Success Flow

Landing Page

↓

Sign Up

↓

Email Verification

↓

Profile Setup

↓

Dashboard

---

## Error Cases

- Email already exists
- Invalid email
- Weak password
- Wrong password
- Email not verified
- Server unavailable

---

## APIs

POST /signup

POST /login

POST /logout

POST /forgot-password

POST /reset-password

GET /profile

PATCH /profile

---

## Future Improvements

- GitHub Login
- Microsoft Login
- Two-Factor Authentication (2FA)
- Biometric Login (Mobile App)