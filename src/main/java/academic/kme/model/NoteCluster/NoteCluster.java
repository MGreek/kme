package academic.kme.model.NoteCluster;

import academic.kme.model.Voice.Voice;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class NoteCluster {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne
    private Voice voice;

    @Embedded
    private PureNoteCluster pureNoteCluster;

    @Embedded
    private GraphicHints hints;
}
