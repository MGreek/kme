package academic.kme.controller.CommandLine;

import academic.kme.controller.CommandLine.CommandTree.CommandTree;
import academic.kme.model.Document.Document;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommandLineController {
    private Document document;

    @Getter
    private CommandTree commandTree = CommandTree.defaultCommandTree;
}
