package academic.kme.model.Staff;

import academic.kme.model.Document.Document;
import academic.kme.model.Measure.Measure;
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
public class Staff {
    @Id
    private UUID id = UUID.randomUUID();

    @ManyToOne
    private Document document;

    @OneToMany(mappedBy = "staff", cascade = CascadeType.PERSIST)
    @OrderColumn
    private List<Measure> measures;
}