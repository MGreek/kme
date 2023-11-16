package academic.kme.model.Document;

import jakarta.persistence.Embeddable;

@Embeddable
public class SheetMusicSettings {
    private double linesHeight;
    private double linesBottomPadding;

    public SheetMusicSettings()
    { }

    public SheetMusicSettings(double linesHeight, double linesBottomPadding) {
        this.linesHeight = linesHeight;
        this.linesBottomPadding = linesBottomPadding;
    }

    public double getLinesHeight() {
        return linesHeight;
    }

    public void setLinesHeight(double linesHeight) {
        this.linesHeight = linesHeight;
    }

    public double getLinesBottomPadding() {
        return linesBottomPadding;
    }

    public void setLinesBottomPadding(double linesBottomPadding) {
        this.linesBottomPadding = linesBottomPadding;
    }
}
