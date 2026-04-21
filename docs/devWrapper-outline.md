# devWrapper.ts - Script Outline

## Purpose

Development script that fetches the latest Pokémon GO game master data and generates a structured masterfile with various Pokémon GO data entities (Pokémon, moves, items, invasions, etc.)

---

## Main Flow

### 1. Data Fetching

- Fetches latest game master JSON from PokeMiners GitHub repository
- Saves raw data to `./latest.json` for reference

### 2. Command-Line Argument Processing

- `--pokeapi-staging`: Uses PokeAPI staging environment
- `--pokeapi`: Uses PokeAPI production (or static cached data if neither flag)
- `--raw`: Generates raw data format
- `--test`: Enables test mode for file output
- `--invasions`: Generates Team Rocket invasion data

### 3. Data Generation

- Calls the `generate()` function from `src/index.ts`
- Passes configuration options based on command-line flags
- Either uses PokeAPI (live or staging) or static cached files:
  - `static/baseStats.json` - Base stats data
  - `static/tempEvos.json` - Temporary evolution data
  - `static/types.json` - Type effectiveness data
- Times the generation process

### 4. Test Mode File Output

When `--test` flag is present:

#### a. Invasion Data

- If `--invasions` flag: Writes `invasions.json` with Team Rocket invasion data

#### b. PokeAPI Cache Update

- If using PokeAPI: Updates static cache files with fresh data:
  - `static/baseStats.json`
  - `static/tempEvos.json`
  - `static/types.json`
- Removes PokeAPI data from final output

#### c. Masterfile Output

- Writes complete generated data to `./masterfile.json`

### 5. Completion

- Logs generation time
- Handles errors
- Confirms successful generation

---

## Key Features

- **Flexible data sources**: Can use live PokeAPI or cached static data
- **Modular output**: Different flags control what data is generated
- **Development-friendly**: Timing, error handling, and formatted JSON output
- **Cache management**: Updates static files when using live PokeAPI
- **Test mode**: Prevents accidental production runs without explicit flag

## Usage Examples

```bash
# Generate with default settings (using static cache)
yarn generate

# Generate using live PokeAPI data
yarn pokeapi

# Generate raw format data
yarn raw

# Generate invasion data
yarn invasions
```

## Command-Line Flags

| Flag                | Description                                 |
| ------------------- | ------------------------------------------- |
| `--test`            | Enable test mode (required for file output) |
| `--pokeapi`         | Use PokeAPI production environment          |
| `--pokeapi-staging` | Use PokeAPI staging environment             |
| `--raw`             | Generate raw data format                    |
| `--invasions`       | Generate Team Rocket invasion data          |

## Output Files

| File                    | Condition                      | Description                          |
| ----------------------- | ------------------------------ | ------------------------------------ |
| `latest.json`           | Always                         | Raw game master data from PokeMiners |
| `masterfile.json`       | `--test` flag                  | Complete generated masterfile        |
| `invasions.json`        | `--test` + `--invasions` flags | Team Rocket invasion data            |
| `static/baseStats.json` | `--test` + `--pokeapi*` flags  | Pokemon base stats cache             |
| `static/tempEvos.json`  | `--test` + `--pokeapi*` flags  | Temporary evolutions cache           |
| `static/types.json`     | `--test` + `--pokeapi*` flags  | Type effectiveness cache             |
