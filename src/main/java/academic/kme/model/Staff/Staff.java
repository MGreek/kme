package academic.kme.model.Staff;

import academic.kme.model.Document.Document;
import academic.kme.model.Measure.Measure;
import jakarta.persistence.*;

import java.util.List;
import java.util.UUID;

@Entity
public class Staff {
    @Id
    private UUID id = UUID.randomUUID();
    @ManyToOne
    private Document document;
    @OneToMany(mappedBy = "staff", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Measure> measures;

    public Staff()
    { }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public Document getDocument() { return document; }
    public void setDocument(Document document) { this.document = document; }
    public List<Measure> getMeasures() { return measures; }
    public void setMeasures(List<Measure> measures) { this.measures = measures; }
}