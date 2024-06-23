package com.example.kmebackend.model

import jakarta.persistence.*

enum class KeySignature {
    Flat7,
    Flat6,
    Flat5,
    Flat4,
    Flat3,
    Flat2,
    Flat1,
    None,
    Sharp1,
    Sharp2,
    Sharp3,
    Sharp4,
    Sharp5,
    Sharp6,
    Sharp7,
}

enum class TimeSignature {
    Common,
    FourFour,
    ThreeFour,
    TwoFour,
}

enum class Clef {
    Treble,
    Alto,
    Bass,
}

@Embeddable
data class MeasureId(
    @Embedded
    val staffId: StaffId,
    @Column(name = "measures_order")
    val measuresOrder: Int,
)

@Entity
data class Measure(
    @EmbeddedId
    val measureId: MeasureId? = null,
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumns(
        // all columns from StaffId
        JoinColumn(
            name = "staff_system_id",
            referencedColumnName = "staff_system_id",
            insertable = false,
            updatable = false,
        ),
        JoinColumn(
            name = "staves_order",
            referencedColumnName = "staves_order",
            insertable = false,
            updatable = false,
        ),
    )
    val staff: Staff? = null,
    @Enumerated(EnumType.STRING)
    val keySignature: KeySignature,
    @Enumerated(EnumType.STRING)
    val timeSignature: TimeSignature,
    @Enumerated(EnumType.STRING)
    val clef: Clef,
    @Lob
    val metadataJson: String = "",
)