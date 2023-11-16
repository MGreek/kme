package academic.kme.model.Note;

import academic.kme.model.Measure;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class Note {
    // default empty c-tor for hibernate
    public Note()
    { }

    public Note(Length length, Accidental accidental, Integer offset) {
        this.length = length;
        this.accidental = accidental;
        this.offset = offset;
    }

    public enum Length {
        Whole,
        Half,
        Quarter,
        Eight,
        Sixteenth,
        ThirtySecond,
        SixtyFourth
    }

    public enum Accidental {
        None,
        Natural,
        Flat,
        DoubleFlat,
        Sharp,
        DoubleSharp
    }
    @Id
    private UUID id = UUID.randomUUID();
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Length length;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Accidental accidental;
    @Column
    private Integer offset; // 0 is on the first line (bottom to top); null means this note is a rest
    @ManyToOne
    private Measure measure;
    @Embedded
    private NoteSettings settings;

    public UUID getId() {
        return id;
    }
    public void setId(UUID id) { this.id = id; }

    public Length getLength() {
        return length;
    }

    public void setLength(Length length) {
        this.length = length;
    }

    public Accidental getAccidental() {
        return accidental;
    }

    public void setAccidental(Accidental accidental) {
        this.accidental = accidental;
    }

    public Integer getOffset() {
        return offset;
    }

    public void setOffset(Integer offset) {
        this.offset = offset;
    }

    public Measure getMeasure() {
        return measure;
    }

    public void setMeasure(Measure measure) {
        this.measure = measure;
    }
}
