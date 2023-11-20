<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About the project</a>
      <ul>
        <li><a href="#built-with">Built with</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

## About the project

Twmap is a web application for creating png/gif maps based on Tribal Wars real game data.

### Built with

- Typescript
- Docker
- Node.js
- Express.js
- Postgresql
- Prisma
- Pug.js
- Jest

### Examples

Map:

<img src="https://github.com/kamil-poncyliusz/twmap/blob/31a451d5cc3fb4c8c83d9a5f94b47d09cab396a1/public/images/examples/map5.png" alt="map0" width="500" height="500">

Animation:

<img src="https://github.com/kamil-poncyliusz/twmap/blob/31a451d5cc3fb4c8c83d9a5f94b47d09cab396a1/public/images/examples/animation.gif" alt="animation" width="500" height="500">

## Getting started

TBD

### Prerequisites

- docker installed
- docker compose installed

### Installation

1. Clone the repo:

```sh
git clone https://github.com/kamil-poncyliusz/twmap.git
```

2. Move to the project directory:

```sh
cd twmap
```

3. (Optional) Edit .env.dist file and change "SESSION_SECRET" and "ADMIN_ACCOUNT_PASSWORD" environment variables

4. Application runs on port 8080 by default. If you want to change it, edit docker-compose.yml and change line 12 to include your port:

```yml
- "YOUR_PORT:8080"
```

6. Build and run the project:

```sh
docker compose up -d
```

6. Open a browser and go to localhost:8080

## Usage

Languages are not implemented yet, Polish is my native language. Translate website to your language if you need to.
User needs an account to save maps on the server in the form of collections. Collections can be used to create animated maps.

### Using generator to create a map

1. Click "Create a map" to enter the generator.

2. Select a world and turn.

3. Under "Marks" tab, create groups and add tribes that You want to mark on the map.

4. Under "Captions" tab, create captions to print on the map.

5. Tweak some settings under "Settings" tab to customize the map.

6. Done! Save the map using context menu and use it however You want.

### Publishing generated map

1. Log in your accoount.

2. Follow all steps from previous section.

3. Enter a title and description for a new map.

4. Choose existing collection or pick "\<Create new\>".

5. Confirm the process with "Add to collection" button.

6. To view your collection: Profile -> My collections -> New collection

### Creating a GIF animation

1. Repeat previous section several times to make a collection containing multiple maps.

2. View you collection.

3. Turn on "Animation creator mode".

4. Uncheck the maps you don't want in the animation.

5. Choose frame interval and submit animation with "Create animation" button.

### Using settings codes

TBD

### Adding a new world

TBD

### Adding a new world based on archive data

TBD

## License

TBD

## Contributing

TBD

## Contact

Email: - kamil.poncyliusz@gmail.com

Github repo: [github.com/kamil-poncyliusz/twmap](https://github.com/kamil-poncyliusz/twmap)
