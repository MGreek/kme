class Node<T> {
  private _edges = new Map<string, Node<T>>();

  public get edges() {
    return this._edges;
  }

  public set edges(value) {
    this._edges = value;
  }

  private _data: T | null = null;

  public get data(): T | null {
    return this._data;
  }

  public set data(value: T | null) {
    this._data = value;
  }
}

export class Trie<T> {
  private root = new Node<T>();

  public addWord(word: string, data: T): boolean {
    let node = this.root;
    for (const char of word) {
      let child = node.edges.get(char);
      if (child == null) {
        child = new Node();
        node.edges.set(char, child);
      }
      if (child.data != null) {
        return false;
      }
      node = child;
    }
    if (node.edges.keys.length !== 0) {
      return false;
    }
    node.data = data;
    return true;
  }

  public isPrefix(word: string): boolean {
    let node = this.root;
    for (const char of word) {
      const child = node.edges.get(char);
      if (child == null) {
        return false;
      }
      node = child;
    }
    return true;
  }

  public getDataByWord(word: string): T | null {
    let node = this.root;
    for (const char of word) {
      const child = node.edges.get(char);
      if (child == null) {
        return null;
      }
      node = child;
    }
    return node.data;
  }
}
