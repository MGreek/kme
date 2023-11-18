package academic.kme.model.NoteCluster;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Lob;

import java.util.List;

@Embeddable
public class PureNoteCluster {
    @Lob@ElementCollection
    List<Integer> lines;
    byte length;
    Integer accidental;

    public PureNoteCluster()
    { }

    public List<Integer> getLines() { return lines; }
    public void setLines(List<Integer> lines) { this.lines = lines; }
    public byte getLength() { return length; }
    public void setLength(byte length) { this.length = length; }
    public Integer getAccidental() { return accidental; }
    public void setAccidental(Integer accidental) { this.accidental = accidental; }
}
