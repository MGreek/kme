package academic.kme.controller.Graphics.Primitive;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteStem {
    private double x;
    private List<NoteHead> noteHeads;

    private NoteFlag noteFlag;
    private boolean flipped;
}
