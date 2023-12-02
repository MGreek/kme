package academic.kme.controller.Graphics.Primitive;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StaffLines {
    List<Clef> clefs;
    List<TimeSignature> timeSignatures;
    List<Accidental> accidentals;
    List<NoteStemGroup> noteStemGroups;
}
