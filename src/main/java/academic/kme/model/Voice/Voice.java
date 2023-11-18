package academic.kme.model.Voice;

import academic.kme.model.Measure.Measure;
import academic.kme.model.NoteCluster.NoteCluster;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
public class Voice {
    @Id
    private UUID id = UUID.randomUUID();
    @ManyToOne
    private Measure measure;
    @OneToMany(mappedBy = "voice", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<NoteCluster> noteClusters;

    public Voice()
    { }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Measure getMeasure() { return measure; }
    public void setMeasure(Measure measure) { this.measure = measure; }
    public List<NoteCluster> getNoteClusters() { return noteClusters; }
    public void setNoteClusters(List<NoteCluster> noteClusters) { this.noteClusters = noteClusters; }
}
