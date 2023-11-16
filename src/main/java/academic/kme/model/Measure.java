package academic.kme.model;

import academic.kme.model.Note.Note;
import jakarta.persistence.*;

import java.util.ArrayList;
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

    // default empty c-tor for hibernate
    public Measure()
    { }

    public Measure(Clef clef, TimeSignature timeSignature, Integer armor, List<Note> notes) {
        this.clef = clef;
        this.timeSignature = timeSignature;
        this.armor = armor;
        this.notes = new ArrayList<>();
        for (Note note : notes) {
            addNote(note);
        }
    }

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

    public void addNote(Note note) {
        notes.add(note);
        note.setMeasure(this);
    }

    public void removeNote(Note note) {
        notes.remove(note);
        note.setMeasure(null);
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }
}
