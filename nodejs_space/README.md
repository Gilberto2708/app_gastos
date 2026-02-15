# Shared Expense Tracker API

A NestJS backend service for managing shared expenses between couples with PIN-based authentication.

## Features

- 🔐 **PIN-based Authentication** with JWT tokens
- 📊 **Category Management** for organizing expenses
- 💰 **Expense Tracking** with receipt uploads
- 📈 **Budget Management** (weekly/monthly)
- 📉 **Statistics & Analytics** by category and time period
- 🏥 **Health Check** endpoint for monitoring
- 📚 **Swagger Documentation** for API exploration

## Tech Stack

- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with bcrypt password hashing
- **File Upload**: Local storage with Multer
- **Validation**: class-validator
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Node.js 18.x or higher
- PostgreSQL database
- Yarn package manager

## Local Development

### 1. Clone and Install

```bash
cd nodejs_space
yarn install
```

### 2. Configure Environment

Create a `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Update the following variables:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/expense_tracker
JWT_SECRET=your-secure-secret-key
PORT=3000
NODE_ENV=development
```

### 3. Database Setup

```bash
# Generate Prisma client
yarn prisma generate

# Push schema to database
yarn prisma db push

# Seed default data (PIN: 0000 and 6 categories)
yarn prisma db seed
```

### 4. Start Development Server

```bash
yarn start:dev
```

The server will be available at:
- **API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs
- **Health Check**: http://localhost:3000/health

### 5. Test the API

Default PIN for testing: `0000`

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"pin": "0000"}'

# Use the returned token in subsequent requests
curl http://localhost:3000/api/categories \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Deployment

### Deploy to Render

1. **Create a new Web Service** on [Render](https://render.com)
2. **Connect your repository**
3. **Configure the service**:
   - **Build Command**: `cd nodejs_space && yarn install && yarn build`
   - **Start Command**: `cd nodejs_space && yarn start:prod`
   - **Environment**: Node
4. **Add a PostgreSQL database**:
   - Create a new PostgreSQL database on Render
   - Copy the internal database URL
5. **Set Environment Variables**:
   ```
   DATABASE_URL=your_render_postgres_url
   JWT_SECRET=your_secure_secret_key
   PORT=3000
   NODE_ENV=production
   ```
6. **Deploy**: Render will automatically build and deploy
7. **Seed the database** (one-time):
   - Open the Shell tab in Render dashboard
   - Run: `cd nodejs_space && yarn prisma db seed`

### Deploy to Railway

1. **Install Railway CLI** or use the web dashboard
2. **Login**: `railway login`
3. **Create a new project**: `railway init`
4. **Add PostgreSQL**:
   ```bash
   railway add postgresql
   ```
5. **Set Environment Variables**:
   ```bash
   railway variables set JWT_SECRET="your_secure_secret_key"
   railway variables set NODE_ENV="production"
   ```
6. **Configure build settings** in `railway.toml`:
   ```toml
   [build]
   builder = "NIXPACKS"
   buildCommand = "cd nodejs_space && yarn install && yarn build"

   [deploy]
   startCommand = "cd nodejs_space && yarn start:prod"
   healthcheckPath = "/health"
   ```
7. **Deploy**: `railway up`
8. **Seed the database**:
   ```bash
   railway run cd nodejs_space && yarn prisma db seed
   ```

### Deploy to Fly.io

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Login**: `fly auth login`
3. **Launch the app**: `fly launch`
   - Choose a unique app name
   - Select a region
   - Don't deploy yet (we need to add database first)
4. **Create PostgreSQL database**:
   ```bash
   fly postgres create
   fly postgres attach your-postgres-app-name
   ```
5. **Set secrets**:
   ```bash
   fly secrets set JWT_SECRET="your_secure_secret_key"
   fly secrets set NODE_ENV="production"
   ```
6. **Deploy**: `fly deploy`
7. **Seed the database**:
   ```bash
   fly ssh console
   cd nodejs_space && yarn prisma db seed
   ```

## API Endpoints

### Authentication
- `POST /api/auth/setup` - First-time PIN setup
- `POST /api/auth/login` - Login with PIN

### Categories (requires authentication)
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Expenses (requires authentication)
- `GET /api/expenses` - Get expenses (with filters)
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Budgets (requires authentication)
- `GET /api/budgets` - Get all budgets
- `POST /api/budgets` - Create budget
- `PUT /api/budgets/:id` - Update budget
- `GET /api/budgets/current` - Get current active budget

### Statistics (requires authentication)
- `GET /api/stats/weekly` - Get weekly statistics
- `GET /api/stats/by-category` - Get statistics by category

### File Upload (requires authentication)
- `POST /api/upload/receipt` - Upload receipt image

### Health
- `GET /health` - Health check endpoint

## Database Schema

### Auth Table
- `id` (UUID, Primary Key)
- `pinhash` (String, Unique) - Bcrypt hashed PIN
- `createdat` (DateTime)
- `updatedat` (DateTime)

### Categories Table
- `id` (UUID, Primary Key)
- `name` (String)
- `color` (String) - Hex color code
- `icon` (String) - Icon identifier
- `createdat` (DateTime)
- `updatedat` (DateTime)

### Expenses Table
- `id` (UUID, Primary Key)
- `amount` (Decimal)
- `categoryid` (UUID, Foreign Key)
- `date` (DateTime)
- `description` (Text)
- `receipturl` (String, Nullable)
- `createdat` (DateTime)
- `updatedat` (DateTime)

### Budgets Table
- `id` (UUID, Primary Key)
- `amount` (Decimal)
- `type` (Enum: WEEKLY, MONTHLY)
- `startdate` (DateTime)
- `enddate` (DateTime)
- `createdat` (DateTime)
- `updatedat` (DateTime)

## Default Seed Data

**Default PIN**: `0000`

**Default Categories**:
1. Food - #FF5733 - restaurant
2. Transport - #3498DB - directions_car
3. Entertainment - #9B59B6 - movie
4. Bills - #E74C3C - receipt
5. Shopping - #F39C12 - shopping_bag
6. Others - #95A5A6 - category

## Security Notes

⚠️ **Important**: 
- Change the default PIN (`0000`) after first deployment
- Use a strong, random JWT_SECRET in production
- Enable HTTPS on your hosting platform
- Regularly backup your PostgreSQL database
- Consider implementing rate limiting for the login endpoint

## Development Scripts

```bash
# Development
yarn start:dev          # Start with hot reload
yarn build              # Build for production
yarn start:prod         # Start production build

# Database
yarn prisma generate    # Generate Prisma client
yarn prisma db push     # Push schema to database
yarn prisma db seed     # Seed database with default data
yarn prisma studio      # Open Prisma Studio GUI

# Testing
yarn test               # Run unit tests
yarn test:e2e           # Run end-to-end tests
yarn test:cov           # Run tests with coverage

# Code Quality
yarn lint               # Lint code
yarn format             # Format code with Prettier
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL is correctly formatted
- Verify firewall rules allow database connections

### Build Failures
- Clear node_modules: `rm -rf node_modules && yarn install`
- Clear build cache: `rm -rf dist`
- Ensure Node.js version is 18.x or higher

### Authentication Errors
- Verify JWT_SECRET is set in environment variables
- Check token is included in Authorization header
- Ensure PIN is correctly hashed in database

## Support

For issues and questions, please check:
- API Documentation at `/api/docs`
- Health status at `/health`
- Server logs for error details

## License

MIT
