package academic.kme.model.Document;

import academic.kme.model.Measure.Clef;
import academic.kme.model.Measure.Measure;
import academic.kme.model.Measure.PureMeasure;
import academic.kme.model.Measure.TimeSignature;
import academic.kme.model.NoteCluster.Accidental;
import academic.kme.model.NoteCluster.NoteCluster;
import academic.kme.model.NoteCluster.NoteHead;
import academic.kme.model.NoteCluster.PureNoteCluster;
import academic.kme.model.Staff.Staff;
import academic.kme.model.Voice.Voice;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    public static Document defaultDocument;

    static {
        defaultDocument = new Document();
        Staff staff = new Staff();
        Measure measure = new Measure();
        Voice voice = new Voice();
        NoteCluster noteCluster = new NoteCluster();
        List<NoteHead> noteHeads = new ArrayList<>();
        NoteHead noteHead = new NoteHead(0, Accidental.None);

        noteHeads.add(noteHead);

        noteCluster.setVoice(voice);
        noteCluster.setHints(new academic.kme.model.NoteCluster.GraphicHints());
        noteCluster.setPureNoteCluster(new PureNoteCluster(noteHeads, (byte) 1));

        voice.setMeasure(measure);
        voice.setNoteClusters(new ArrayList<>());
        voice.getNoteClusters().add(noteCluster);

        measure.setStaff(staff);
        measure.setHints(new academic.kme.model.Measure.GraphicHints());
        measure.setPureMeasure(new PureMeasure(Clef.Treble, 0, TimeSignature.FourFour));
        measure.setVoices(new ArrayList<>());
        measure.getVoices().add(voice);

        staff.setDocument(defaultDocument);
        staff.setMeasures(new ArrayList<>());
        staff.getMeasures().add(measure);

        defaultDocument.setHints(new GraphicHints());
        defaultDocument.setStaves(new ArrayList<>());
        defaultDocument.getStaves().add(staff);
    }

    @Id
    private UUID id = UUID.randomUUID();

    @Embedded
    private GraphicHints hints;

    @OneToMany(mappedBy = "document", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Staff> staves;
}
