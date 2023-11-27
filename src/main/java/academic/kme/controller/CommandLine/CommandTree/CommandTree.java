package academic.kme.controller.CommandLine.CommandTree;

import lombok.Getter;
import lombok.Setter;

import java.util.Objects;
import java.util.function.Consumer;

public class CommandTree {
    public static CommandTree defaultCommandTree;

    static {
        defaultCommandTree = new CommandTree();
        Node root = defaultCommandTree.root;
        root.addNeighbour('j');
        root.addNeighbour('k');
        root.addNeighbour('h');
        root.addNeighbour('l');
    }

    private final Node root = new Node();

    @Getter
    private Node current = root;

    @Getter
    private String path = "";

    @Setter
    private Runnable onSubmitEnter;

    @Setter
    private Consumer<String> onPathChangedEnter;

    private void setPath(String path) {
        this.path = path;
        onPathChangedEnter.accept(path);
    }
    public void clear() {
        current = root;
        if (!Objects.equals(path, "")) {
            setPath("");
        }
    }

    public void applySymbol(char symbol) {
        if (symbol == '\n') {
            if (onSubmitEnter != null) {
                onSubmitEnter.run();
            }
            current = root;
            setPath("");
            return;
        }
        current = Objects.requireNonNullElse(current.getNeighbour(symbol), root);
        if (current == root) {
            if (onSubmitEnter != null) {
                onSubmitEnter.run();
            }
            if (!Objects.equals(path, "")) {
                setPath("");
            }
        }
        else {
            setPath(path + symbol);
            if (current.neighbourCount() == 0) {
                if (onSubmitEnter != null) {
                    onSubmitEnter.run();
                }
                current = root;
                setPath("");
            }
        }
    }

    public void applyWord(String word) {
        for (int i = 0; i < word.length(); ++i) {
            applySymbol(word.charAt(i));
        }
    }
}
