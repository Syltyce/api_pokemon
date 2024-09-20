import { DataTypes, Sequelize } from "sequelize";

export const pokemon_model = (sequelize, DataTypes) => {
    return sequelize.define('Pokemon', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true, 
            autoIncrement: true
        },
        nom: {
            type: DataTypes.STRING,
            allowNull: false 
        },
        hp: {
            type: DataTypes.INTEGER,
            allowNull: false 
        },
        cp: {
            type: DataTypes.INTEGER,
            allowNull: false 
        },
        pictures: {
            type: DataTypes.STRING,
            allowNull: false 
        },
        types: {
            type: DataTypes.STRING,
            allowNull: false 
        }
    }, {
        timestamps: true,
        createdAt: 'created', 
        updatedAt: false
    })

}