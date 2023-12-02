package academic.kme.model.NoteCluster;

import jakarta.persistence.Convert;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PureNoteCluster {
    @Lob
    @Convert(converter = NoteHeadListConverter.class)
    List<NoteHead> noteHeads;
    byte length;
}
