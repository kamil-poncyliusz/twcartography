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

Twmap is a web application for creating png/gif maps based on actual Tribal Wars game data.

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

```bash
git clone https://github.com/kamil-poncyliusz/twmap.git
```

2. Move to the project directory:

```bash
cd twmap
```

3. Create .env file based on default.env:

Windows:

```powershell
copy default.env .env
```

Linux/MacOS:

```bash
cp default.env .env
```

4. (Optional) Edit ".env" file and change environment variables.

5. Build and run the project (choose a version):

Production environment:

```bash
docker compose -f docker-compose-production.yml up -d
```

or

```bash
npm run production
```

Development environment:

```bash
docker compose up
```

or

```bash
npm run dev
```

6. Run the browser and open the application at localhost:port (localhost:8080 by default)

```
localhost:8080
```

## Usage

User needs an account to save maps on the server in the form of collections.
Collections can be used to create animated maps.

### Using generator to create a map

1. Click "Create a map" to enter the generator.

2. Select a world and turn.

3. Under "Marks" tab, create groups and add tribes that You want to mark on the map.

4. Under "Captions" tab, create captions to print on the map.

5. Tweak some settings under "Settings" tab to customize the map.

6. Done! Save the map image and use it however You want.

Tips:

- Right-click on a mark group color to change it to a random color.

### Publishing generated map

1. Log in your accoount.

2. Follow all steps from previous section.

3. Enter a title and description for a new map.

4. Choose existing collection or pick "\<Create new\>".

5. Confirm the process with "Add to collection" button.

6. To view your collection: Profile -> My collections -> New collection

### Creating a GIF animation

1. Repeat previous section several times to create a collection containing multiple maps.

2. View you collection.

3. Turn on "Animation creator mode".

4. Uncheck the maps you don't want in the animation.

5. Choose a frame interval.

6. Submit animation with "Create animation" button. When animation is finished, the browser will reload the page.

Tips:

- Each time you create a frame, turn off "Trim" option and enter a fixed output size to ensure that all frames (created maps) have the same width and height.

- To choose a right output size, start from the last frame where the world is most expanded.

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
