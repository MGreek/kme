package academic.kme.model.Measure;

import jakarta.persistence.Embeddable;

@Embeddable
public class PureMeasure {
    Clef clef;
    Integer armor;
    TimeSignature timeSignature;

    public PureMeasure()
    { }

    public Clef getClef() { return clef; }
    public void setClef(Clef clef) { this.clef = clef; }
    public Integer getArmor() { return armor; }
    public void setArmor(Integer armor) { this.armor = armor; }
    public TimeSignature getTimeSignature() { return timeSignature; }
    public void setTimeSignature(TimeSignature timeSignature) { this.timeSignature = timeSignature; }
}
