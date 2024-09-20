import express from "express";
import { pokemons } from "./pokemons.js"
import { success } from "./sucess.js";
import morgan from "morgan";
import bodyParser from "body-parser";
import { Sequelize, DataTypes } from "sequelize";
import { pokemon_model } from "./models/pokemon.js";

// Variables
const app = express();
const port = 3000; 
const logger = (req, res, next) => {
    console.log(`url de la req = ${req.url}`);
    next();
}
const sequelize = new Sequelize(
    'pokedex',
    'root',
    '',
    {
        host: 'localhost',
        dialect: 'mariadb',
        dialectOptions: {
            timezone: 'Etc/GMT-2'
        },
        logging: false
    }
)
const Pokemon = pokemon_model(sequelize, DataTypes)

sequelize.authenticate()
    .then(_ => console.log('la sychronisation est reussie'))
    .catch(error => console.error(`echec synchro, erreur ${error}`))

sequelize.sync({ force: true })
    .then(_ => { 
        console.log('la connexion a la db est etablie avec succes')
        pokemons.map(pokemon => {
            Pokemon.create({
                nom: pokemon.nom,
                hp: pokemon.hp,
                cp: pokemon.cp,
                pictures: pokemon.pictures,
                types: pokemon.types.join()
            }).then(pokemon => console.log(pokemon.toJSON()))
        })
        console.log('les données de la bdd ont bien été réinitialisées');
    })
    .catch(error => console.error(`impossible de se connecter à la base de données, erreur ${error}`))

export function getUniqueId(pokemons) {
    const pokemonsIds = pokemons.map(pokemon => pokemon.id);
    const maxId = pokemonsIds.reduce((a, b) => Math.max(a, b));
    const uniqueId = maxId +1;

    return uniqueId;
}

app.use(logger);

app
    .use(morgan('dev'))
    .use(bodyParser.json());

app.use(express.json());

// Indique le nombre de pokemon dans l'API 
app.get('/api/pokemon', (req, res) => {
    console.log(`Nombre de pokemon dans notre db : ${pokemons.length}`);
    res.send(`Nombre de pokemon dans notre db : ${pokemons.length}`);
});

// Méthode de modification
app.put('/api/pokemon/:id', (req, res) => {
    let id = parseInt(req.params.id);
    const pokemonIndex = pokemons.findIndex(pokemon => pokemon.id === id);

    // Mise à jour du Pokémon
    const pokemonUpdated = { ...pokemons[pokemonIndex], ...req.body };
    pokemons[pokemonIndex] = pokemonUpdated;

    const message = `Le Pokémon ${pokemonUpdated.nom} a bien été modifié`;
    res.json(success(message, pokemonUpdated));
});

// Route vers un pokemon en particulier avec son id qui affiche un message ainsi que le JSON des informations du pokemon en question 
app.get('/api/pokemon/:id', (req, res) => {
    let id = parseInt(req.params.id);
    const pokemon = pokemons.find(pokemon => pokemon.id === id);
    const message = `Voici les données de ${pokemon.nom}`;
    res.json(success(message, pokemon));
});

// Main Route (localhost) de l'API Pokemon 
app.get('/', (req, res) => {
    res.send("API POKEMON");
})


// Création d'une requete POST pour créer un nouveau Pokemon avec Postman
app.post('/api/pokemons', (req, res) => {
    const id = getUniqueId(pokemons);
    const pokemonCreated = { ...req.body, ...{ id: id, created: new Date() } };
    pokemons.push(pokemonCreated)
    const message = `Le pokémon ${pokemonCreated.nom} a bien été créé`
    res.json(success(message, pokemonCreated));
})

// Permet d'ajouter les pokémons créés avec la requête Post grâce à Postman 
app.get('/api/pokemons', (req, res) => {
    res.status(200).json(success(`nombre de pokemon = ${pokemons.length} `, pokemons));
})

app.listen(port, () => {
    console.log(`app : ${port}`);
});