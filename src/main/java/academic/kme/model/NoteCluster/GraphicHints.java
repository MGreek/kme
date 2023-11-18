package academic.kme.model.NoteCluster;

import jakarta.persistence.Embeddable;

@Embeddable
public class GraphicHints {
    boolean upsideDown;

    public GraphicHints()
    { }

    public boolean isUpsideDown() { return upsideDown; }
    public void setUpsideDown(boolean upsideDown) { this.upsideDown = upsideDown; }
}
