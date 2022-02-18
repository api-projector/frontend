import { Constructor, deserialize, Serializer } from 'serialize-ts';

export class EdgesToPaging<T> implements Serializer<T> {

    constructor(private type: Constructor<T>) {

    }

    serialize(source: T): string {
        throw new Error('Was not implemented');
    }

    deserialize({node}): T {
        return deserialize(node, this.type);
    }
}

export class EdgesToArray<T> implements Serializer<T[]> {

    constructor(private type: Constructor<T>) {

    }

    serialize(source: T[]): string {
        throw new Error('Was not implemented');
    }

    deserialize({edges}: { edges: { node }[] }): T[] {
        return edges.map(e => deserialize(e.node, this.type));
    }
}

