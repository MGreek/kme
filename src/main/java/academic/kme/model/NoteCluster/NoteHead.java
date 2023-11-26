package academic.kme.model.NoteCluster;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteHead implements Serializable {
    private int offset;
    private Accidental accidental;
}
