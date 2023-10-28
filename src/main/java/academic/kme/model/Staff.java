package academic.kme.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Staff {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @OneToMany(mappedBy = "staff", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Measure> measures;
    @ManyToOne
    private Document document;

    public List<Measure> getMeasures() {
        return measures;
    }

    public void setMeasures(List<Measure> measures) {
        this.measures = measures;
    }

    public Integer getId() {
        return id;
    }

    public Document getDocument() {
        return document;
    }
}
