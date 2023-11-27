package academic.kme.controller.CommandLine.CommandTree;

import java.util.HashMap;
import java.util.Map;

public class Node {
    private final Map<Character, Node> neighbours = new HashMap<>();

    public Node addNeighbour(char symbol) {
        Node newNode = new Node();
        neighbours.put(symbol, newNode);
        return newNode;
    }

    public void removeNeighbour(char symbol) {
        neighbours.remove(symbol);
    }

    public Node getNeighbour(char symbol) {
        return neighbours.get(symbol);
    }

    public int neighbourCount() {
        return neighbours.size();
    }
}
