package academic.kme.model.Voice;

import academic.kme.model.Measure.Measure;
import academic.kme.model.NoteCluster.NoteCluster;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Voice {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne
    private Measure measure;

    @OneToMany(mappedBy = "voice", fetch = FetchType.LAZY, cascade = CascadeType.PERSIST, orphanRemoval = true)
    @OrderColumn
    private List<NoteCluster> noteClusters;

    @Embedded
    private GraphicHints graphicHints;
}
