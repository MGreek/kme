package academic.kme.model.NoteCluster;

import academic.kme.model.Voice.Voice;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class NoteCluster {
    @Id
    private UUID id = UUID.randomUUID();
    @ManyToOne
    private Voice voice;
    @Embedded
    private PureNoteCluster pureNoteCluster;
    @Embedded
    private GraphicHints hints;

    public NoteCluster()
    { }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Voice getVoie() { return voice; }
    public void setVoie(Voice voie) { this.voice = voie; }
    public PureNoteCluster getPureNoteCluster() { return pureNoteCluster; }
    public void setPureNoteCluster(PureNoteCluster pureNoteCluster) { this.pureNoteCluster = pureNoteCluster; }
    public GraphicHints getHints() { return hints; }
    public void setHints(GraphicHints hints) { this.hints = hints; }
}
