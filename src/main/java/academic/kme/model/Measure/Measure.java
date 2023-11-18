package academic.kme.model.Measure;

import academic.kme.model.NoteCluster.NoteCluster;
import academic.kme.model.Staff.Staff;
import academic.kme.model.Voice.Voice;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
public class Measure {
    @Id
    private UUID id = UUID.randomUUID();
    @ManyToOne
    private Staff staff;
    @OneToMany(mappedBy = "measure", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Voice> voices;
    @Embedded
    private PureMeasure pureMeasure;
    @Embedded
    private GraphicHints hints;

    public Measure()
    { }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public List<Voice> getVoices() { return voices; }
    public void setVoices(List<Voice> voices) { this.voices = voices; }
    public PureMeasure getPureMeasure() { return pureMeasure; }
    public void setPureMeasure(PureMeasure pureMeasure) { this.pureMeasure = pureMeasure; }
    public GraphicHints getHints() { return hints; }
    public void setHints(GraphicHints hints) { this.hints = hints; }
}
