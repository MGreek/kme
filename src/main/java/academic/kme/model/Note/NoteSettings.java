package academic.kme.model.Note;


import jakarta.persistence.Embeddable;

@Embeddable
public class NoteSettings {
    public NoteSettings()
    { }

    public NoteSettings(boolean upsideDown) {
        this.upsideDown = upsideDown;
    }
    boolean upsideDown;

    public boolean isUpsideDown() {
        return upsideDown;
    }

    public void setUpsideDown(boolean upsideDown) {
        this.upsideDown = upsideDown;
    }
}
