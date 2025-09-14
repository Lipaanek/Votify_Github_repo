# VoxPlatform URL Structure

## Overview

VoxPlatform is a secure online voting platform designed for schools, community groups, and companies. This document outlines the proposed URL structure to support scalable, intuitive navigation and clear separation of user types.

## Domain Architecture

### Main Domain
- **Primary Domain**: `voxplatform.com`
- **Purpose**: Central landing page and cross-platform features

### Subdomain Structure
To provide clear separation and branding for different user segments:

- `schools.voxplatform.com` - Educational institutions
- `groups.voxplatform.com` - Community groups and organizations
- `companies.voxplatform.com` - Corporate environments

## URL Path Structure

### Public Routes (No Authentication Required)

| Path | Description | What Happens |
|------|-------------|--------------|
| `/` | Landing page | Displays platform overview, features, and user type selection |
| `/login` | User login | Email-based authentication with verification code |
| `/register` | User registration | Account creation with email verification |
| `/verify` | Email verification | 6-digit code verification for login/register |
| `/about` | About page | Platform information and security details |
| `/contact` | Contact page | Support and contact information |
| `/privacy` | Privacy policy | Data handling and privacy information |
| `/terms` | Terms of service | Platform usage terms and conditions |

### Authenticated User Routes

| Path | Description | What Happens |
|------|-------------|--------------|
| `/dashboard` | User dashboard | Overview of active votes, groups, and recent activity |
| `/profile` | Profile management | Update personal information and preferences |
| `/groups` | My groups | List of groups the user belongs to |
| `/groups/create` | Create group | Form to create new voting group |
| `/groups/:id` | Group details | View group information, members, and active votes |
| `/groups/:id/join` | Join group | Request to join existing group |
| `/votes` | Available votes | List of votes user can participate in |
| `/votes/:id` | Vote details | View vote information and cast ballot |
| `/votes/:id/results` | Vote results | View results (if allowed) |
| `/history` | Voting history | Past votes and results |

### Administrator Routes (Group/Organization Admins)

| Path | Description | What Happens |
|------|-------------|--------------|
| `/admin/dashboard` | Admin dashboard | Group management overview |
| `/admin/groups/:id` | Group management | Edit group settings, members |
| `/admin/members` | Member management | Add/remove members, manage roles |
| `/admin/votes/create` | Create vote | Form to create new vote for group |
| `/admin/votes/:id/edit` | Edit vote | Modify vote settings before start |
| `/admin/votes/:id/manage` | Vote management | Monitor and manage active vote |
| `/admin/results/:id` | Results management | Control result visibility and export |

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/login` | POST | Send verification code to email |
| `/api/auth/verify` | POST | Verify code and authenticate |
| `/api/auth/register` | POST | Create new user account |
| `/api/groups` | GET/POST | List groups or create new |
| `/api/groups/:id` | GET/PUT | Get group details or update |
| `/api/votes` | GET/POST | List votes or create new |
| `/api/votes/:id` | GET | Get vote details |
| `/api/votes/:id/vote` | POST | Cast vote |
| `/api/votes/:id/results` | GET | Get vote results |
| `/api/info/groups` | GET | Gets the information about user's profile (joined groups) |

## Routing and Navigation Flow

### User Journey Examples

#### New School User Registration
1. Visit `schools.voxplatform.com/`
2. Click "Register" → `/register`
3. Enter email → `/verify`
4. Enter verification code → `/dashboard`
5. Create or join school group → `/groups/create` or `/groups/:id/join`

#### Corporate Voting Session
1. Visit `companies.voxplatform.com/login`
2. Authenticate → `/dashboard`
3. View available votes → `/votes`
4. Participate in vote → `/votes/:id`
5. View results → `/votes/:id/results`

#### Group Administrator
1. Login → `/dashboard`
2. Access admin panel → `/admin/dashboard`
3. Create new vote → `/admin/votes/create`
4. Manage group members → `/admin/members`

## Technical Implementation Notes

### Frontend Routing
- React Router for client-side routing
- Protected routes for authenticated content
- Role-based route guards
- Subdomain detection for user type context

### Backend Routing
- Express.js with modular route handlers
- Subdomain-based middleware for user type
- Authentication middleware for protected routes
- API versioning under `/api/v1/`

### Security Considerations
- HTTPS enforcement
- JWT token authentication
- CSRF protection
- Rate limiting on authentication endpoints
- Audit logging for all voting actions

## Future Expansion

### Additional Subdomains
- `universities.voxplatform.com` - Higher education
- `governments.voxplatform.com` - Government organizations
- `associations.voxplatform.com` - Professional associations

### Feature Extensions
- `/elections` - Multi-round elections
- `/surveys` - Non-binding surveys
- `/analytics` - Advanced reporting
- `/integrations` - Third-party integrations

This structure provides a solid foundation for a scalable, secure voting platform with clear user segmentation and intuitive navigation.

## Domain Registration and Subdomain Setup

### Domain Registration Process

1. **Purchase Main Domain**: Register `voxplatform.com` through a domain registrar
   - Cost: $10-20/year
   - Recommended registrars: Namecheap, GoDaddy, Porkbun
   - Choose a registrar with good DNS management tools

2. **DNS Configuration for Subdomains**:
   - Access your domain's DNS settings in the registrar's control panel
   - Add a wildcard CNAME record: `*.voxplatform.com` → `your-server-ip-or-domain`
   - Or add individual CNAME records for each subdomain:
     - `schools.voxplatform.com` → `your-server-ip-or-domain`
     - `groups.voxplatform.com` → `your-server-ip-or-domain`
     - `companies.voxplatform.com` → `your-server-ip-or-domain`

3. **Server-Side Subdomain Handling**:
   - In your Express.js server, check `req.headers.host` to determine the subdomain
   - Route requests based on subdomain (schools, groups, companies)
   - Example code:
     ```javascript
     app.use((req, res, next) => {
       const host = req.headers.host;
       if (host.includes('schools.voxplatform.com')) {
         req.userType = 'schools';
       } else if (host.includes('groups.voxplatform.com')) {
         req.userType = 'groups';
       } else if (host.includes('companies.voxplatform.com')) {
         req.userType = 'companies';
       }
       next();
     });
     ```

4. **SSL Certificate Setup**:
   - Use Let's Encrypt for free SSL certificates
   - Configure wildcard certificate for `*.voxplatform.com`
   - Or use cloud provider's certificate management

### DNS Propagation Time
- DNS changes can take 24-48 hours to propagate globally
- Test subdomains using tools like `dig` or online DNS checkers

## Hosting Recommendations

### Cloud Hosting Services

#### 1. **AWS (Amazon Web Services)**
- **Best for**: Enterprise-scale applications
- **Services to use**:
  - EC2 for servers
  - Route 53 for DNS management
  - CloudFront for CDN
  - RDS for databases
- **Cost**: $50-200/month depending on usage
- **Pros**: Highly scalable, robust security, global infrastructure
- **Cons**: Complex setup, steeper learning curve

#### 2. **DigitalOcean**
- **Best for**: Developer-friendly, cost-effective
- **Services to use**:
  - Droplets (VPS)
  - Load Balancers
  - Managed Databases
- **Cost**: $12-100/month
- **Pros**: Simple interface, good documentation, SSD storage
- **Cons**: Less global presence than AWS

#### 3. **Vercel/Netlify**
- **Best for**: Frontend-heavy applications
- **Services to use**:
  - Serverless functions
  - Edge network
  - Automatic SSL
- **Cost**: Free tier available, $20-100/month for pro
- **Pros**: Easy deployment, great for React apps, global CDN
- **Cons**: Limited backend capabilities, vendor lock-in

#### 4. **Heroku**
- **Best for**: Quick deployment, managed hosting
- **Services to use**:
  - Dynos (containers)
  - Postgres database
  - Redis add-on
- **Cost**: Free tier, $7-500/month
- **Pros**: Easy scaling, managed infrastructure
- **Cons**: Expensive at scale, limited customization

### Recommended Setup for VoxPlatform

#### Development Phase
- **Domain**: Namecheap ($10/year)
- **Hosting**: DigitalOcean Droplet ($12/month)
- **Database**: DigitalOcean Managed Database ($15/month)
- **Email**: SendGrid or Mailgun (free tier available)

#### Production Phase
- **Domain**: Namecheap or AWS Route 53
- **Hosting**: AWS EC2 + CloudFront ($50-150/month)
- **Database**: AWS RDS ($30-100/month)
- **Email**: AWS SES or SendGrid

### Deployment Checklist

1. Register domain
2. Set up DNS records
3. Provision hosting server
4. Configure SSL certificates
5. Deploy application code
6. Set up database
7. Configure email service
8. Test all subdomains
9. Set up monitoring and backups
10. Configure CDN for static assets

### Cost Estimation (Monthly)

- **Domain**: $1-2
- **Basic Hosting**: $12-50
- **Database**: $15-50
- **Email Service**: $0-20
- **SSL/CDN**: $0-20
- **Total**: $28-142/month for small-medium scale

This setup provides a cost-effective, scalable foundation for your voting platform with room for growth.