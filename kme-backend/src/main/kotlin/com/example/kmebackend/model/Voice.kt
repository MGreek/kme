package com.example.kmebackend.model

import jakarta.persistence.*

@Embeddable
data class VoiceId(
    @Embedded
    val measureId: MeasureId,
    @Column(name = "voices_order")
    val voicesOrder: Long,
)

@Entity
data class Voice(
    @EmbeddedId
    val voiceId: VoiceId,
    @MapsId("measureId") @ManyToOne
    val measure: Measure,
    @OneToMany(mappedBy = "voice")
    @OrderColumn(name = "groupings_order")
    val groupings: List<Grouping> = emptyList(),
    val metadata: String? = null,
)
