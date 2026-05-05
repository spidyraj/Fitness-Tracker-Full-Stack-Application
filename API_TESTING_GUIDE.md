# 🚀 Fitness Tracker API Testing Guide

## 📋 Prerequisites
- Backend running on `http://localhost:8080`
- Postman or similar API testing tool
- JWT token for authenticated endpoints

## 🔐 Authentication Endpoints

### 1. User Registration
```http
POST http://localhost:8080/api/users/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe", 
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

### 2. User Login
```http
POST http://localhost:8080/api/users/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Returns JWT token
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "email": "john.doe@example.com",
  "firstName": "John"
}
```

## 👤 User Profile Endpoints (Requires JWT)

### 3. Get User Profile
```http
GET http://localhost:8080/api/users/profile
Authorization: Bearer <JWT_TOKEN>
```

### 4. Update User Profile
```http
PUT http://localhost:8080/api/users/profile
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "weight": 75.5,
  "height": 180,
  "age": 30,
  "gender": "MALE",
  "activityLevel": "MODERATE"
}
```

## 💪 Workout Endpoints (Requires JWT)

### 5. Get All Workouts
```http
GET http://localhost:8080/api/workouts
Authorization: Bearer <JWT_TOKEN>
```

### 6. Create New Workout
```http
POST http://localhost:8080/api/workouts
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Morning Run",
  "type": "CARDIO",
  "duration": 30,
  "caloriesBurned": 250,
  "date": "2026-05-05T10:00:00"
}
```

### 7. Get Workout by ID
```http
GET http://localhost:8080/api/workouts/{workoutId}
Authorization: Bearer <JWT_TOKEN>
```

### 8. Update Workout
```http
PUT http://localhost:8080/api/workouts/{workoutId}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Morning Run",
  "duration": 35,
  "caloriesBurned": 300
}
```

### 9. Delete Workout
```http
DELETE http://localhost:8080/api/workouts/{workoutId}
Authorization: Bearer <JWT_TOKEN>
```

## 🥗 Nutrition Endpoints (Requires JWT)

### 10. Get All Nutrition Entries
```http
GET http://localhost:8080/api/nutrition
Authorization: Bearer <JWT_TOKEN>
```

### 11. Create Nutrition Entry
```http
POST http://localhost:8080/api/nutrition
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Protein Shake",
  "calories": 150,
  "protein": 25,
  "carbs": 10,
  "fat": 2,
  "date": "2026-05-05T08:00:00"
}
```

### 12. Update Nutrition Entry
```http
PUT http://localhost:8080/api/nutrition/{nutritionId}
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "name": "Updated Protein Shake",
  "calories": 180,
  "protein": 30
}
```

### 13. Delete Nutrition Entry
```http
DELETE http://localhost:8080/api/nutrition/{nutritionId}
Authorization: Bearer <JWT_TOKEN>
```

## 🤖 AI Fitness Coach (Requires JWT)

### 14. Get AI Fitness Advice
```http
POST http://localhost:8080/api/ai/fitness-advice
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "prompt": "Give me tips for building muscle mass",
  "userId": 1
}
```

## 📊 Analytics Endpoints (Requires JWT)

### 15. Get User Analytics
```http
GET http://localhost:8080/api/analytics/summary
Authorization: Bearer <JWT_TOKEN>
```

### 16. Get Workout Statistics
```http
GET http://localhost:8080/api/analytics/workouts?period=WEEKLY
Authorization: Bearer <JWT_TOKEN>
```

## 🔍 Database Testing

### 17. H2 Console Access
- URL: `http://localhost:8080/h2-console`
- JDBC URL: `jdbc:h2:mem:fitnessdb`
- Username: `sa`
- Password: `password`

**Test SQL Queries:**
```sql
-- Check users table
SELECT * FROM users;

-- Check workouts table  
SELECT * FROM workouts;

-- Check nutrition table
SELECT * FROM nutrition_entries;

-- Check user relationships
SELECT u.firstName, w.name, w.date 
FROM users u 
JOIN workouts w ON u.id = w.user_id;
```

## 🧪 Testing Workflow

### Step 1: Register New User
1. Call registration endpoint
2. Verify user created in H2 database

### Step 2: Login and Get Token
1. Call login endpoint
2. Save JWT token for subsequent requests

### Step 3: Test Profile Management
1. Get current profile
2. Update profile with personal details
3. Verify changes in database

### Step 4: Test Workout CRUD
1. Create multiple workouts
2. List all workouts
3. Update a workout
4. Delete a workout
5. Verify database state

### Step 5: Test Nutrition CRUD
1. Create nutrition entries
2. List nutrition data
3. Update entries
4. Delete entries
5. Verify database state

### Step 6: Test AI Integration
1. Call AI advice endpoint
2. Verify response format
3. Check console logs for AI interactions

## 📝 Expected Response Codes

- `200 OK` - Successful GET/PUT/DELETE
- `201 Created` - Successful POST
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Missing or invalid JWT
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

## 🐛 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Ensure JWT token is included in Authorization header
```
Authorization: Bearer <your_jwt_token>
```

### Issue: 400 Bad Request
**Solution:** Check JSON body format and required fields
- Email must be valid format
- Password must meet requirements (8+ chars, uppercase, lowercase, number, special char)

### Issue: 500 Internal Server Error
**Solution:** Check backend logs and H2 database connection
- Verify H2 console is accessible
- Check application.properties configuration

## 🔧 Postman Collection Setup

1. **Create Environment Variables:**
   - `base_url`: `http://localhost:8080`
   - `jwt_token`: `{{login_response.token}}`

2. **Set Authorization:**
   - Type: Bearer Token
   - Token: `{{jwt_token}}`

3. **Test Collection Order:**
   - Register User
   - Login
   - Get Profile
   - Update Profile  
   - Create Workout
   - Get Workouts
   - Create Nutrition
   - Get Nutrition
   - Test AI Advice

## 📈 Success Criteria

✅ **All endpoints return expected responses**
✅ **Database persistence working correctly**
✅ **JWT authentication functioning**
✅ **CRUD operations working**
✅ **H2 database accessible via console**
✅ **Error handling appropriate**

Your fitness tracker API is ready for comprehensive testing! 🎉
