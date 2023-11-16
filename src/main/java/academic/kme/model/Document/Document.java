package academic.kme.model.Document;

import academic.kme.model.Measure;
import academic.kme.model.Note.Note;
import academic.kme.model.Staff;
import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
public class Document {
    public static Document EmptyDocument;

    static {
        List<Note> notes = new ArrayList<>();
        notes.add(new Note(Note.Length.Whole, Note.Accidental.None, 0));

        List<Measure> measures = new ArrayList<>();
        measures.add(new Measure(Measure.Clef.Treble, Measure.TimeSignature.FourFour, 0, notes));

        List<Staff> staves = new ArrayList<>();
        staves.add(new Staff(measures));

        EmptyDocument = new Document(new Padding(5, 5, 5, 5),
                new SheetMusicSettings(30, 5), staves);
    }

    @Id
    private UUID id = UUID.randomUUID();

    @Embedded
    private Padding padding;

    @Embedded
    private SheetMusicSettings sheetMusicSettings;

    @OneToMany(mappedBy = "document", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Staff> staves;

    // default empty c-tor for hibernate
    public Document() {
        staves = new ArrayList<>();
    }
    public Document(Padding padding, SheetMusicSettings sheetMusicSettings, List<Staff> staves) {
        this.padding = padding;
        this.sheetMusicSettings = sheetMusicSettings;
        this.staves = new ArrayList<>();
        for (Staff staff : staves) {
            addStaff(staff);
        }
    }

    public List<Staff> getStaves() {
        return staves;
    }

    public void setStaves(List<Staff> staves) { this.staves = staves; }

    public void addStaff(Staff staff) {
        staves.add(staff);
        staff.setDocument(this);
    }

    public void removeStaff(Staff staff) {
        staves.remove(staff);
        staff.setDocument(null);
    }

    public Padding getPadding() { return padding; }

    public void setPadding(Padding padding) { this.padding = padding; }

    public SheetMusicSettings getSheetMusicSettings() {
        return sheetMusicSettings;
    }

    public void setSheetMusicSettings(SheetMusicSettings sheetMusicSettings) {
        this.sheetMusicSettings = sheetMusicSettings;
    }

    public UUID getId() { return id; }

    public void setId(UUID id) { this.id = id; }
}
