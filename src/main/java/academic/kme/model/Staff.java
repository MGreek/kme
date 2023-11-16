package academic.kme.model;

import academic.kme.model.Document.Document;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
public class Staff {
    @Id
    private UUID id = UUID.randomUUID();
    @OneToMany(mappedBy = "staff", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Measure> measures;
    @ManyToOne
    private Document document;

    // default empty c-tor for hibernate
    public Staff()
    { }

    public Staff(List<Measure> measures) {
        this.measures = new ArrayList<>();
        for (Measure measure : measures) {
            addMeasure(measure);
        }
    }

    public List<Measure> getMeasures() {
        return measures;
    }

    public void addMeasure(Measure measure) {
        measures.add(measure);
        measure.setStaff(this);
    }

    public void removeMeasure(Measure measure) {
        measures.remove(measure);
        measure.setStaff(null);
    }

    public void setMeasures(List<Measure> measures) {
        this.measures = measures;
    }

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) { this.id = id; }

    public Document getDocument() {
        return document;
    }

    public void setDocument(Document document) {
        this.document = document;
    }
}
