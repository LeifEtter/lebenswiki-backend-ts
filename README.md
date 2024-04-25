# Lebenswiki Backend

The Lebenswiki Backend is consumed by the Lebenswiki Mobile App. Users can register and manage accounts. They can also create and publish content such as Packs (interactive articles) and Shorts (twitter-like posts).
The Backend is part of the Lebenswiki Project, a project that strives to provide youths and young adults with a centralized repository for knowledge and interactive ways of learning.

This documentation gives an overview of the App's Components and their Interactions. It assumes basic knowledge of JS, Node and Express, as well as the principles of REST API's.

---

## Installation

**Prerequisites**

- [Node](https://nodejs.org/en/download) and NPM installed
- MySQL Server installed and running

Log into the mysql console with the admin account, and then enter the password:

```other
mysql -u [username] -p
```

Then to create the database run this command inside the mysql console:

```bash
CREATE DATABASE lebenswikiDB;
```

Create a new user with a custom password:

```other
CREATE USER 'lebenswiki_app'@'localhost' IDENTIFIED BY '[password]';
```

Select to use the db:

```other
USE lebenswikiDB;
```

Then grant permissions to the Database we previously created:

```other
GRANT CREATE, ALTER, DROP, INSERT, UPDATE, DELETE, SELECT, REFERENCES on *.* TO 'factchecker_app'@'localhost';
```

Create a ".env" file in the project root directory and add following lines, and replace [password] with the password previously set in the CREATE USER query:

```bash
PORT=5858
ENV=DEVELOPMENT
JWT_SECRET=8W1cwe/l6XlSqhb9
DATABASE_URL=mysql://lebenswiki_app:[password]@localhost:3306/lebenswikiDB
```

Notes: The JWT_SECRET can be any string.
If using a different host then localhost:3306 for the db adjust it correspondingly.

To install the dependencies, run this in the projects root directory:

```bash
npm i
```

Back in the root directory tell prisma to push the Schema to the database:

```bash
npx prisma migrate dev
```

Then to generate the roles and anonymous account run the seed command:

```bash
npx prisma db seed
```

---

## Architecture

Tech Stack: Node/ExpressJS/Typescript/Prisma/MySQL

The Backend is built on a monolithic architecture. It uses ExpressJS as the routing framework, and is developed using Typescript. For Linting the project uses eslint.

The app mainly consists of routers, controllers and helpers. Routers contain the paths to the different resources (routes) and implement the middleware and controllers that are used for each specific route.
Some controllers use helpers to get or convert data, and the controllers as well as the helpers access the database through a Prisma instance.

![Blank diagram (2).png](https://res.craft.do/user/full/b0e62220-21e7-3e79-e368-d4886dca007e/doc/B28F4E97-A6F7-42D6-9388-3D049F72B1F7/E58B443B-EEE0-4D4F-AF58-3C29BFDF7DE4_2/f7xcCk2pSi4gAIBAVk17AWh0Xkhp8wZca4Q6Uh7wzOQz/Blank%20diagram%202.png)

---

## Database

The database is MySQL. To make database querying easier and safer, the backend uses Prisma, an Object Relational Mapper. The [Schema](prisma/schema.prisma) file contains all the models and their relationships.

---

## Naming Schema

Most files have a naming schema as follows:

::[purpose of file]::.::[location/main folder]::.::[subfolder]::.ts

A file containing a middleware for authentication that is located in the middleware folder would be named: ::authentication::.::middleware::.ts

A file for bookmark routes, which is located in a subfolder of pack, which is inside the components folder would be named: ::controller::.::bookmark::.::pack::.ts

This choice was made, so that open files can always be distinguished from VSCode's topbar without having to check the folder tree on the left hand side.

**Caching**

Certain routes are cached using node-cache. When a user makes a request to these routes, the controller will try to retrieve a cached response first.

```typescript
const cacheKey: string = `category-getPacksForCategory-${res.locals.id}-${res.locals.user.id}`;
const cachedRes = cache.get(cacheKey);
if (cachedRes) return res.status(200).send(cachedRes);
```

If no cache is found, the controller continues as usual, and saves the response body in the cache, using the cache key and cache duration:

```typescript
cache.set(cacheKey, packs, CACHE_DURATION);
```

---

## **Security**

Besides the Security Principles mentioned in the [Hosting section](craftdocs://open?blockId=B0B658A9-69B0-4638-B0F2-0F6C7E955373&spaceId=b0e62220-21e7-3e79-e368-d4886dca007e), the Backend employs a few ways of securing requests.

**HTTPS**

All communication between the client and backend is encrypted.

**Authentication**

Users that create an account need to provide an email adress and password. The Backend uses **bcrypt** to generate a hash, and stores this in the database.

```typescript
const encryptedPassword: string = await bcrypt.hash(password, SALT_ROUNDS);
```

```typescript
const passwordIsValid: boolean = await bcrypt.compare(
  req.body.password,
  user.password
);
```

When a user logs in, they receive a jwt token as a response. This jwt token will have to be passed in future requests for the backend to verify who they are.

**Authorization**

Every user receives a role and a corresponding "accessLevel". The App uses a custom middleware called "minRole" to determine if a user is allowed to request a certain route. **Validation**

Routes that receive body data or implement id's use a validation middleware, provided by express-validator, to check wether the passed information has a valid format. The validator also escapes any malicious code, to prevent injection. The body tag is the implementation of the validation middleware:

```typescript
router.route("/register").post(
  body("email").exists().escape().isEmail(),
  body("password").exists().escape().isStrongPassword({
    minSymbols: 1,
    minUppercase: 1,
    minLength: 6,
  }),
  body("name").exists().escape().isString().isLength({ min: 3 }),
  body("biography").escape().isString(),
  checkValidatorResult({
    resource: "User",
    msg: "Please make sure you are passing an email, password, name and biography.",
  }),
  register
);
```

Furthermore this enables protection against brute-force attacks, as the password validation enforces a strong password.

**Limits**

Besides the automatic DDOS protection AWS implements, the app implements a rate limiter:

```typescript
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
```

Also a limit for requests is set by the bodyParser:

```typescript
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));
```

---

## Testing

For testing, the app uses jest. End to End Tests were done using the supertest library. (see [**tests**](__tests__)).
Load Testing was done using Artillery.
lowing is an excerpt of the [artillery config](__load-testing__/artillery-load.yml), where i defined the routes to be tested:

```typescript
scenarios:
  - flow:
      - loop:
          - get:
              url: "/pack"
          - get:
              url: "/pack/categorized"
          - get:
              url: "/short"
          - get:
              url: "/short/categorized"
          - get:
              url: "/category/packsAndShorts"
        count: 20
```

---

## Hosting

The Backend is comprised of a Node Application, a Database and a File Storage. Each of these are hosted on different AWS services.

![Blank diagram (1).png](https://res.craft.do/user/full/b0e62220-21e7-3e79-e368-d4886dca007e/doc/B28F4E97-A6F7-42D6-9388-3D049F72B1F7/3057E481-358C-4699-9671-0A9C7E1EB73D_2/ewNf9BKTjnAENcUH4GBmCp6YI8UBcw7h0xLMKjlEvUEz/Blank%20diagram%201.png)

**Express Application** Hosted in an Elastic Compute instance. This Instance uses the PM2 daemon to keep the backend running. Nginx manages the ports, and forwards requests to the internal port **5858.** Certificates for HTTPS communication are issued by letsencrypt.

**Database**

The Database is a Mysql Database hosted by AWS RDBS. I chose this over hosting a Mysql database inside an EC2 Container, as RDBS provides easier backups and scaling, and assures 100% uptime.

**VPC**

To secure the database, the node application and database are contained inside a VPC. This means that the database can only be accessed through the ec2 instance. Applications such as DataGrip may access the database by using an SSH tunnel.

**File Storage**

All images for avatars and packs are stored inside an S3 Bucket. The images are served to applications accessing the API, by generating a presigned url which can be used to directly view the images from outside AWS. The Access keys are loaded inside the EC2 instance.

---

## Logging

The app uses Pino to log events. It implements mostly info and error log events, and these are written to the console and an `app.log` file.
