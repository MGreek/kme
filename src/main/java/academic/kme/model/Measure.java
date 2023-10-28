package academic.kme.model;

import jakarta.persistence.*;

import java.util.List;

@Entity
public class Measure {
    public enum Clef {
        Treble,
        Bass
    }

    public enum TimeSignature {
        FourFour,
        ThreeFour,
        TwoFour
    }
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Clef clef;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TimeSignature timeSignature;
    @Column(nullable = false)
    private Integer armor; // -1 is one flat; 0 is nothing; 1 is one sharp; etc.
    @OneToMany(mappedBy = "measure", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Note> notes;
    @ManyToOne
    private Staff staff;

    public Integer getId() {
        return id;
    }

    public Clef getClef() {
        return clef;
    }

    public void setClef(Clef clef) {
        this.clef = clef;
    }

    public TimeSignature getTimeSignature() {
        return timeSignature;
    }

    public void setTimeSignature(TimeSignature timeSignature) {
        this.timeSignature = timeSignature;
    }

    public Integer getArmor() {
        return armor;
    }

    public void setArmor(Integer armor) {
        this.armor = armor;
    }

    public List<Note> getNotes() {
        return notes;
    }

    public void setNotes(List<Note> notes) {
        this.notes = notes;
    }

    public Staff getStaff() {
        return staff;
    }
}
