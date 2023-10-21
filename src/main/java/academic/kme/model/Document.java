package academic.kme.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Column(nullable = false)
    private Integer tabNumber;
    @OneToMany(mappedBy = "document", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Staff> staves;

    public Integer getTabNumber() {
        return tabNumber;
    }

    public void setTabNumber(Integer tabNumber) {
        this.tabNumber = tabNumber;
    }

    public List<Staff> getStaves() {
        return staves;
    }

    public void setStaves(List<Staff> staves) {
        this.staves = staves;
    }

    public Integer getId() {
        return id;
    }
}
