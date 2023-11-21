package academic.kme.model.Document;

import academic.kme.model.Staff.Staff;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
public class Document {
    public static Document DefaultDocument;

    @Id
    private UUID id = UUID.randomUUID();
    @Embedded
    private GraphicHints hints;
    @OneToMany(mappedBy = "document", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Staff> staves;

    public Document()
    { }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public GraphicHints getHints() { return hints; }
    public void setHints(GraphicHints hints) { this.hints = hints; }
    public List<Staff> getStaves() { return staves; }
    public void setStaves(List<Staff> staves) { this.staves = staves; }
}
