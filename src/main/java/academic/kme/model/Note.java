package academic.kme.model;

import jakarta.persistence.*;

@Entity
public class Note {
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
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Length length;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Accidental accidental;
    @Column(nullable = false)
    private Integer offset; // 0 is on the first bottom to top
    @ManyToOne
    private Measure measure;

    public Integer getId() {
        return id;
    }

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
}
