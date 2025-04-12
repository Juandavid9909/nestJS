import { Move, PokeapiResponse } from "../interfaces/pokeapi-response.interface";
import { HttpAdapter, PokeApiAdapter, PokeApiFetchAdapter } from "../api/pokeApi.adapter";

export class Pokemon {
    constructor(
        public readonly id: number,
        public name: string,
        private readonly http: HttpAdapter,
    ) {}

    get imageUrl(): string {
        return `https://pokemon.com/${ this.id }.jpg`;
    }

    static scream() {
        console.log(`${ this.name.toUpperCase() }!!!`);
    }

    private speak() {
        console.log(`${ this.name }, ${ this.name }`);
    }

    async getMoves(): Promise<Move[]> {
        this.speak();

        const data = await this.http.get<PokeapiResponse>(`https://pokeapi.co/api/v2/pokemon/${ this.id }`);

        return data.moves;
    }
}

const pokeApiAxios = new PokeApiAdapter();
const pokeApiFetch = new PokeApiFetchAdapter();

export const charmander = new Pokemon(4, "Charmander", pokeApiFetch);

charmander.getMoves();